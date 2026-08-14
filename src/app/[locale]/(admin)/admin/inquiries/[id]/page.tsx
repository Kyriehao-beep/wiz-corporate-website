import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { requireAdmin, type WizLocale } from '@/features/auth/require-admin'
import {
  canTransition,
  INQUIRY_STATUSES,
  type InquiryStatus,
} from '@/features/inquiries/lifecycle'
import {
  getInquiryAttachments,
  getInquiryDetail,
  type InquiryDetail,
  type InquiryStatus as DetailStatus,
} from '@/features/inquiries/query-inquiries'
import {
  addInquiryNoteAction,
  assignInquiryAction,
  updateInquiryStatusAction,
} from '@/features/inquiries/admin-actions'
import { createServiceClient } from '@/lib/supabase/service'
import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return metadataForStaticPage(params, '/admin/inquiries', 'WIZ Console — Inquiry')
}

function statusLabelKey(status: DetailStatus): string {
  return `inquiryStatus${status.charAt(0).toUpperCase()}${status.slice(1)}`
}

function formatDateTime(iso: string, locale: WizLocale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(locale === 'zh-CN' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  await requireAdmin(locale)
  const t = await getTranslations('admin')

  const client = createServiceClient()
  let detail: InquiryDetail | null = null
  let attachments: Awaited<ReturnType<typeof getInquiryAttachments>> = []
  try {
    detail = await getInquiryDetail(id, client)
    if (detail) attachments = await getInquiryAttachments(id, client)
  } catch (err) {
    console.error('[inquiry-detail] failed to load', err)
  }

  if (!detail) {
    return (
      <div className="admin-page">
        <Link href={`/${locale}/admin/inquiries`} className="admin-linkbtn">
          {t('inquiryBack')}
        </Link>
        <p className="admin-banner">{t('inquiryDetailNotFound')}</p>
      </div>
    )
  }

  const allowedTargets = INQUIRY_STATUSES.filter((s) =>
    canTransition(detail!.status, s as InquiryStatus),
  )
  const statusT = (s: DetailStatus) => t(statusLabelKey(s))

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <Link href={`/${locale}/admin/inquiries`} className="admin-linkbtn">
          {t('inquiryBack')}
        </Link>
        <h2 className="admin-page__title">
          {detail.inquiryNumber}
          <span className={`kanban__tag kanban__tag--${detail.status} admin-page__badge`}>
            <span className="badge__dot" aria-hidden="true" />
            {statusT(detail.status)}
          </span>
        </h2>
        <p className="admin-page__intro">
          {detail.companyName}
          {detail.contactName ? ` · ${detail.contactName}` : ''}
        </p>
      </header>

      <div className="detail-grid">
        <section className="detail-card">
          <h3 className="detail-card__title">{t('inquiryStatusLabel')}</h3>
          <dl className="detail-meta">
            <div><dt>{t('inquiryStatusLabel')}</dt><dd>{statusT(detail.status)}</dd></div>
            <div><dt>{t('inquiryLocaleLabel')}</dt><dd>{detail.locale}</dd></div>
            <div><dt>{t('inquirySourceLabel')}</dt><dd>{detail.source}</dd></div>
            <div><dt>{t('inquiryOwnerLabel')}</dt><dd>{detail.ownerId ?? t('inquiryUnassigned')}</dd></div>
            <div><dt>{t('inquiryCreatedAt')}</dt><dd>{formatDateTime(detail.createdAt, locale)}</dd></div>
          </dl>

          <h3 className="detail-card__title">{t('inquiryProjectLabel')}</h3>
          <p className="detail-prose">{detail.projectDescription || '—'}</p>

          <h3 className="detail-card__title">{t('inquiryItemsLabel')}</h3>
          {detail.items.length === 0 ? (
            <p className="detail-muted">{t('inquiryNoItems')}</p>
          ) : (
            <ul className="detail-items">
              {detail.items.map((it, i) => (
                <li key={i}>
                  <strong>{it.productSlug}</strong>
                  {it.applicationSlug ? ` · ${it.applicationSlug}` : ''}
                  <span className="detail-muted"> · {t('inquiryEstQtyLabel')}: {it.estimatedQuantity}</span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="detail-card__title">{t('inquiryAttachmentsLabel')}</h3>
          {attachments.length === 0 ? (
            <p className="detail-muted">{t('inquiryNoAttachments')}</p>
          ) : (
            <ul className="detail-items">
              {attachments.map((a) => (
                <li key={a.id}>
                  {a.displayName} <span className="detail-muted">({formatBytes(a.sizeBytes)})</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="detail-side">
          <section className="detail-card">
            <h3 className="detail-card__title">{t('inquiryOperations')}</h3>

            <form action={updateInquiryStatusAction} className="op-form">
              <p className="op-form__label">{t('inquiryChangeStatus')}</p>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={detail.id} />
              <input type="hidden" name="from" value={detail.status} />
              {allowedTargets.length === 0 ? (
                <p className="detail-muted">{t('inquiryNoActivity')}</p>
              ) : (
                <>
                  <label className="op-form__row">
                    <span>{t('inquiryToStatus')}</span>
                    <select name="to" defaultValue={allowedTargets[0]}>
                      {allowedTargets.map((s: InquiryStatus) => (
                        <option key={s} value={s}>{statusT(s)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="op-form__row">
                    <span>{t('inquiryReasonLabel')}</span>
                    <input type="text" name="reason" placeholder={t('inquiryReasonRequired')} />
                  </label>
                  <button type="submit" className="admin-btn">{t('inquiryApply')}</button>
                </>
              )}
            </form>

            <form action={assignInquiryAction} className="op-form">
              <p className="op-form__label">{t('inquiryAssign')}</p>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={detail.id} />
              <label className="op-form__row">
                <span>{t('inquiryOwnerLabel')}</span>
                <input type="text" name="ownerId" defaultValue={detail.ownerId ?? ''} />
              </label>
              <p className="detail-muted">{t('inquiryAssignHint')}</p>
              <button type="submit" className="admin-btn">{t('inquiryApply')}</button>
            </form>

            <form action={addInquiryNoteAction} className="op-form">
              <p className="op-form__label">{t('inquiryAddNote')}</p>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={detail.id} />
              <label className="op-form__row">
                <span>{t('inquiryNoteHint')}</span>
                <textarea name="note" rows={3} required />
              </label>
              <button type="submit" className="admin-btn">{t('inquiryApply')}</button>
            </form>
          </section>

          <section className="detail-card">
            <h3 className="detail-card__title">{t('inquiryActivityLabel')}</h3>
            {detail.activities.length === 0 ? (
              <p className="detail-muted">{t('inquiryNoActivity')}</p>
            ) : (
              <ul className="detail-activity">
                {detail.activities.map((a, i) => (
                  <li key={i}>
                    <span className="detail-activity__type">
                      {t(`inquiryActivity${a.activityType.charAt(0).toUpperCase()}${a.activityType.slice(1)}`)}
                    </span>
                    <span className="detail-muted">{formatDateTime(a.createdAt, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
