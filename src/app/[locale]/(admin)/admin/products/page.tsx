import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'
import { requireAdmin } from '@/features/auth/require-admin'
import { SupabaseAdminCatalogRepository } from '@/features/catalog/admin-catalog-repository'
import { DeleteProductButton } from '@/components/admin/delete-product-button'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/products', 'WIZ Console — Products')
}

const STATUS_BADGE: Record<'draft' | 'published' | 'archived', { cls: string; key: 'prodStatusDraft' | 'prodStatusLive' | 'prodStatusArchived' }> = {
  draft: { cls: 'draft', key: 'prodStatusDraft' },
  published: { cls: 'live', key: 'prodStatusLive' },
  archived: { cls: 'closed', key: 'prodStatusArchived' },
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  await requireAdmin(locale)
  const t = await getTranslations('admin')

  const repo = new SupabaseAdminCatalogRepository()
  const products = await repo.listProductsAdmin()

  const localePill = (code: 'en' | 'ja' | 'zh-CN', ok: boolean) => (
    <span
      className={`locale-pill ${ok ? 'locale-pill--ok' : 'locale-pill--miss'}`}
      title={ok ? code.toUpperCase() : `${code.toUpperCase()} — ${t('prodLocaleMissing')}`}
    >
      {code === 'zh-CN' ? 'ZH' : code.toUpperCase()}
      {!ok && <span className="visually-hidden"> ({t('prodLocaleMissing')})</span>}
    </span>
  )

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('productsTitle')}</h2>
        <p className="admin-page__intro">{t('productsIntro')}</p>
      </header>
      <div className="admin-page__toolbar">
        <p className="admin-banner admin-banner--live">{t('productsLiveNote')}</p>
        <Link href={`/${locale}/admin/products/new`} className="admin-btn admin-btn--primary">
          {t('prodNew')}
        </Link>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t('prodColName')}</th>
              <th scope="col">{t('prodColStatus')}</th>
              <th scope="col">{t('prodColLocales')}</th>
              <th scope="col">{t('prodColUpdated')}</th>
              <th scope="col">{t('prodColAction')}</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty">
                  {t('prodEmptyList')}
                </td>
              </tr>
            ) : (
              products.map((row) => {
                const badge = STATUS_BADGE[row.status]
                return (
                  <tr key={row.id}>
                    <td className="strong">{row.name}</td>
                    <td>
                      <span className={`badge badge--${badge.cls}`}>
                        <span className="badge__dot" aria-hidden="true" />
                        {t(badge.key)}
                      </span>
                    </td>
                    <td>
                      <span className="locale-group">
                        {localePill('en', !!row.locales.en?.approved)}
                        {localePill('ja', !!row.locales.ja?.approved)}
                        {localePill('zh-CN', !!row.locales['zh-CN']?.approved)}
                      </span>
                    </td>
                    <td className="num">{new Date(row.updatedAt).toISOString().slice(0, 10)}</td>
                    <td>
                      <span className="admin-action-group">
                        <Link
                          href={`/${locale}/admin/products/edit/${row.slug}`}
                          className="admin-linkbtn"
                        >
                          {t('prodEdit')}
                        </Link>
                        <DeleteProductButton
                          locale={locale}
                          slug={row.slug}
                          label={t('prodDelete')}
                          confirmText={t('prodDeleteConfirm')}
                        />
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
