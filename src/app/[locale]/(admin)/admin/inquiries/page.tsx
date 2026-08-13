import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/inquiries', 'WIZ Console — Inquiries')
}

type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'closed'

interface SampleInquiry {
  id: string
  company: string
  product: string
  value: string
}

const COLUMNS: { status: InquiryStatus; key: 'inquiryColNew' | 'inquiryColContacted' | 'inquiryColQuoted' | 'inquiryColWon' | 'inquiryColClosed' }[] = [
  { status: 'new', key: 'inquiryColNew' },
  { status: 'contacted', key: 'inquiryColContacted' },
  { status: 'quoted', key: 'inquiryColQuoted' },
  { status: 'won', key: 'inquiryColWon' },
  { status: 'closed', key: 'inquiryColClosed' },
]

const BOARD: Record<InquiryStatus, SampleInquiry[]> = {
  new: [
    { id: 'INQ-220', company: 'Northwave Gear', product: '2D sew-on patch', value: '180,000' },
    { id: 'INQ-221', company: 'Kestrel Sports', product: 'Hook-and-loop badge', value: '62,000' },
  ],
  contacted: [
    { id: 'INQ-215', company: 'Bluefin Outfitters', product: '3D PVC patch', value: '95,000' },
  ],
  quoted: [
    { id: 'INQ-208', company: 'Mont Alpin', product: 'Heat-transfer label', value: '240,000' },
  ],
  won: [
    { id: 'INQ-199', company: 'Harbor Co.', product: 'Hook-and-loop badge', value: '130,000' },
  ],
  closed: [
    { id: 'INQ-184', company: 'Tide & Pine', product: '2D sew-on patch', value: '150,000' },
  ],
}

export default async function InquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('admin')

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('inquiriesTitle')}</h2>
        <p className="admin-page__intro">{t('inquiriesIntro')}</p>
      </header>
      <p className="admin-banner">{t('inquiriesSampleNote')}</p>
      <div className="kanban">
        {COLUMNS.map((col) => {
          const cards = BOARD[col.status]
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
                    <p className="kanban__id">{card.id}</p>
                    <h3 className="kanban__company">{card.company}</h3>
                    <p className="kanban__product">{card.product}</p>
                    <p className="kanban__meta">
                      <span>{t('inquiryValue')}</span>
                      {card.value}
                    </p>
                    <button type="button" className="admin-linkbtn">{t('inquiryOpen')}</button>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
