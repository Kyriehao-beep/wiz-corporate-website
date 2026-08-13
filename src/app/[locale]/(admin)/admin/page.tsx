import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { isLocale } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin', 'WIZ Console — Dashboard')
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('admin')

  const stats = [
    { label: t('statPendingRfq'), value: '—' },
    { label: t('statOpenInquiries'), value: '—' },
    { label: t('statProductsLive'), value: '—' },
  ]

  return (
    <div className="admin-dashboard">
      <p className="eyebrow">{t('greeting')}</p>
      <h2 className="admin-dashboard__title">{t('consoleName')}</h2>
      <div className="admin-stats">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
      <section className="admin-placeholder">
        <h3>{t('placeholderTitle')}</h3>
        <p>{t('placeholderBody')}</p>
      </section>
    </div>
  )
}
