import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { requireAdmin, type WizLocale } from '@/features/auth/require-admin'
import { queryInquiries, type InquiryStatus, type InquirySummary } from '@/features/inquiries/query-inquiries'
import { createServiceClient } from '@/lib/supabase/service'
import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/inquiries', 'WIZ Console — Inquiries')
}

const COLUMNS: { status: InquiryStatus; key: 'inquiryColNew' | 'inquiryColContacted' | 'inquiryColQuoted' | 'inquiryColWon' | 'inquiryColClosed' }[] = [
  { status: 'new', key: 'inquiryColNew' },
  { status: 'contacted', key: 'inquiryColContacted' },
  { status: 'quoted', key: 'inquiryColQuoted' },
  { status: 'won', key: 'inquiryColWon' },
  { status: 'closed', key: 'inquiryColClosed' },
]

function formatDate(iso: string, locale: WizLocale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default async function InquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  await requireAdmin(locale)
  const t = await getTranslations('admin')

  const client = createServiceClient()
  let rows: InquirySummary[] = []
  try {
    rows = await queryInquiries({}, client)
  } catch (err) {
    console.error('[inquiries] failed to load inquiries', err)
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('inquiriesTitle')}</h2>
        <p className="admin-page__intro">{t('inquiriesIntro')}</p>
      </header>

      {rows.length === 0 ? (
        <p className="admin-banner">{t('inquiriesEmpty')}</p>
      ) : (
        <div className="kanban">
          {COLUMNS.map((col) => {
            const cards = rows.filter((r) => r.status === col.status)
            return (
              <section className="kanban__col" key={col.status} aria-label={t(col.key)}>
                <header className="kanban__head">
                  <span className={`kanban__tag kanban__tag--${col.status}`}>
                    <span className="badge__dot" aria-hidden="true" />
                    {t(col.key)}
                  </span>
                  <span className="kanban__count">{cards.length}</span>
                </header>
                <div className="kanban__cards">
                  {cards.map((card) => (
                    <article className="kanban__card" key={card.id}>
                      <p className="kanban__id">{card.inquiryNumber}</p>
                      <h3 className="kanban__company">{card.companyName}</h3>
                      <p className="kanban__meta">
                        <span>{t('inquiryCompany')}</span>
                        {card.countryRegion}
                      </p>
                      <p className="kanban__meta">
                        <span>{t('inquiryCreatedAt')}</span>
                        {formatDate(card.createdAt, locale)}
                      </p>
                      <button type="button" className="admin-linkbtn">{t('inquiryOpen')}</button>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
