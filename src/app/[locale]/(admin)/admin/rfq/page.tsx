import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/rfq', 'WIZ Console — RFQ')
}

type RfqStatus = 'new' | 'review' | 'quoted' | 'closed'

interface SampleRfq {
  ref: string
  company: string
  product: string
  qty: string
  country: string
  submitted: string
  status: RfqStatus
}

const STATUS_KEY: Record<RfqStatus, 'rfqStatusNew' | 'rfqStatusReview' | 'rfqStatusQuoted' | 'rfqStatusClosed'> = {
  new: 'rfqStatusNew',
  review: 'rfqStatusReview',
  quoted: 'rfqStatusQuoted',
  closed: 'rfqStatusClosed',
}

const SAMPLE: SampleRfq[] = [
  { ref: 'RFQ-2026-0042', company: 'Northwave Gear', product: '2D sew-on patch', qty: '1,200', country: 'Japan', submitted: '2026-08-11', status: 'new' },
  { ref: 'RFQ-2026-0041', company: 'Bluefin Outfitters', product: '3D PVC patch', qty: '500', country: 'United States', submitted: '2026-08-10', status: 'review' },
  { ref: 'RFQ-2026-0040', company: 'Mont Alpin', product: 'Heat-transfer label', qty: '3,000', country: 'France', submitted: '2026-08-09', status: 'quoted' },
  { ref: 'RFQ-2026-0039', company: 'Kestrel Sports', product: 'Hook-and-loop badge', qty: '750', country: 'Australia', submitted: '2026-08-07', status: 'new' },
  { ref: 'RFQ-2026-0038', company: 'Tide & Pine', product: '2D sew-on patch', qty: '2,500', country: 'Canada', submitted: '2026-08-05', status: 'closed' },
]

export default async function RfqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('admin')

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('rfqTitle')}</h2>
        <p className="admin-page__intro">{t('rfqIntro')}</p>
      </header>
      <p className="admin-banner">{t('rfqSampleNote')}</p>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">{t('rfqColRef')}</th>
              <th scope="col">{t('rfqColCompany')}</th>
              <th scope="col">{t('rfqColProduct')}</th>
              <th scope="col" className="num">{t('rfqColQty')}</th>
              <th scope="col">{t('rfqColCountry')}</th>
              <th scope="col">{t('rfqColSubmitted')}</th>
              <th scope="col">{t('rfqColStatus')}</th>
              <th scope="col">{t('rfqColAction')}</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map((row) => (
              <tr key={row.ref}>
                <td className="strong">{row.ref}</td>
                <td>{row.company}</td>
                <td>{row.product}</td>
                <td className="num">{row.qty}</td>
                <td>{row.country}</td>
                <td>{row.submitted}</td>
                <td>
                  <span className={`badge badge--${row.status}`}>
                    <span className="badge__dot" aria-hidden="true" />
                    {t(STATUS_KEY[row.status])}
                  </span>
                </td>
                <td>
                  <button type="button" className="admin-linkbtn">{t('rfqView')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
