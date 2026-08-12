import { AlertTriangle, ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ProductGrid } from '@/features/catalog/product-grid'
import { buildRfqUrl } from '@/features/rfq-link/build-rfq-url'
import type { ApplicationDetail, ProductSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
import { detailCopy } from '@/features/catalog/detail-copy'

export function ApplicationDetailPage({ application, locale, products }: { application: ApplicationDetail; locale: Locale; products: ProductSummary[] }) {
  const t = detailCopy(locale)
  const isSurf = application.slug === 'surf-watersports'
  return <main id="main-content">
    <section className={`application-detail-hero application-detail-hero--${application.tone}`}><Container><p className="eyebrow">{t.applicationLabel} · {application.index}</p><h1>{application.name}</h1><p className="page-lead">{application.description}</p><ButtonLink href={buildRfqUrl({ locale, application: application.slug, source: 'application-detail' })}>{t.start}<ArrowRight aria-hidden="true" size={16}/></ButtonLink></Container></section>
    <section className="content-section"><Container className="application-analysis"><article><p className="eyebrow">{t.problem}</p><h2>{application.buyerProblem}</h2></article><article><p className="eyebrow">{t.consideration}</p><p>{application.attachmentConsiderations}</p></article></Container></section>
    {isSurf ? <section className="caveat-section"><Container><AlertTriangle aria-hidden="true"/><div><p className="eyebrow">{t.caveat}</p><p>{application.attachmentConsiderations}</p></div></Container></section> : null}
    {products.length ? <section className="content-section content-section--raised"><Container><p className="eyebrow">{t.recommended}</p><ProductGrid products={products} locale={locale}/></Container></section> : null}
    <section className="final-cta"><Container><h2>{application.visualDirection}</h2><ButtonLink href={buildRfqUrl({ locale, application: application.slug, source: 'application-footer' })}>{t.start}</ButtonLink></Container></section>
  </main>
}
