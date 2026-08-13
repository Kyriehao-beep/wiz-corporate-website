import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/products', 'WIZ Console — Products')
}

type ProductStatus = 'draft' | 'live'

interface SampleProduct {
  name: string
  type: string
  locales: { en: boolean; ja: boolean; zh: boolean }
  status: ProductStatus
  updated: string
}

const STATUS_KEY: Record<ProductStatus, 'prodStatusDraft' | 'prodStatusLive'> = {
  draft: 'prodStatusDraft',
  live: 'prodStatusLive',
}

const SAMPLE: SampleProduct[] = [
  { name: 'Trail Series 2D Patch', type: 'Sew-on', locales: { en: true, ja: true, zh: true }, status: 'live', updated: '2026-08-11' },
  { name: 'Surf Merit Badge', type: '3D PVC', locales: { en: true, ja: true, zh: false }, status: 'live', updated: '2026-08-10' },
  { name: 'Alpine Heat-Transfer', type: 'Heat-transfer', locales: { en: true, ja: false, zh: false }, status: 'draft', updated: '2026-08-09' },
  { name: 'Harbor Hook-and-Loop', type: 'Hook-and-loop', locales: { en: true, ja: true, zh: true }, status: 'live', updated: '2026-08-06' },
  { name: 'Cascade Adhesive Tag', type: 'Adhesive', locales: { en: true, ja: false, zh: false }, status: 'draft', updated: '2026-08-04' },
]

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('admin')

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
      <p className="admin-banner">{t('productsSampleNote')}</p>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t('prodColName')}</th>
              <th scope="col">{t('prodColType')}</th>
              <th scope="col">{t('prodColLocales')}</th>
              <th scope="col">{t('prodColStatus')}</th>
              <th scope="col">{t('prodColUpdated')}</th>
              <th scope="col">{t('prodColAction')}</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map((row) => (
              <tr key={row.name}>
                <td className="strong">{row.name}</td>
                <td>{row.type}</td>
                <td>
                  <span className="locale-group">
                    {localePill('en', row.locales.en)}
                    {localePill('ja', row.locales.ja)}
                    {localePill('zh-CN', row.locales.zh)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge--${row.status}`}>
                    <span className="badge__dot" aria-hidden="true" />
                    {t(STATUS_KEY[row.status])}
                  </span>
                </td>
                <td>{row.updated}</td>
                <td>
                  <button type="button" className="admin-linkbtn">{t('prodEdit')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
