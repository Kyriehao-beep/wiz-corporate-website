import { ArrowRight } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { buildRfqUrl } from '@/features/rfq-link/build-rfq-url'
import type { Locale } from '@/i18n/locales'
import type { ProductDetail } from '@/features/catalog/types'
import { detailCopy } from '@/features/catalog/detail-copy'

export function ProductDetailPage({ locale, product }: { locale: Locale; product: ProductDetail }) {
  const t = detailCopy(locale)
  return <main id="main-content">
    <section className="detail-hero"><Container className="detail-hero__grid"><div><p className="eyebrow">{t.productLabel} · {product.index}</p><h1>{product.name}</h1><p className="page-lead">{product.description}</p><ButtonLink href={buildRfqUrl({ locale, product: product.slug, source: 'product-detail' })}>{t.start}<ArrowRight aria-hidden="true" size={16}/></ButtonLink></div><div className={`detail-patch detail-patch--${product.tone}`} aria-hidden="true"><span>W</span></div></Container></section>
    <section className="content-section"><Container><div className="detail-spec-grid"><Spec title={t.suitable} items={product.suitability}/><Spec title={t.construction} items={product.construction}/><Spec title={t.visual} items={product.visualOptions}/><Spec title={t.attachment} items={product.attachmentOptions}/></div></Container></section>
    <section className="dimension-section"><Container><p className="eyebrow">{t.visual}</p><h2>{t.choice}</h2><div className="dimension-grid"><article><span>02</span><h3>{t.flat}</h3><p>{t.flatText}</p><div className="relief-demo relief-demo--flat"/></article><article><span>03</span><h3>{t.relief}</h3><p>{t.reliefText}</p><div className="relief-demo relief-demo--deep"/></article></div></Container></section>
    <section className="content-section"><Container className="artwork-note"><div><p className="eyebrow">{t.artwork}</p><h2>{product.artworkGuidance}</h2></div><ButtonLink variant="secondary" href={`/${locale}/products`}>{t.products}</ButtonLink></Container></section>
  </main>
}

function Spec({ title, items }: { title: string; items: string[] }) { return <article><p className="eyebrow">{title}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article> }
