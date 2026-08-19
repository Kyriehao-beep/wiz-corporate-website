import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ProductSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
export function ProductCard({ product, locale }: { product: ProductSummary; locale: Locale }) { return <article className={`catalog-card catalog-card--${product.tone}`}><div className="catalog-card__top"><span>{product.index}</span><span>{product.eyebrow}</span></div>{product.image ? (<div className="catalog-card__media"><Image alt={product.image.alt[locale]} fill sizes="(max-width: 800px) 100vw, 33vw" src={product.image.src} style={{ objectPosition: product.image.objectPosition }}/></div>) : (<div className="catalog-card__shape" aria-hidden="true"><span>W</span></div>)}<div><h3><Link href={`/${locale}/products/${product.slug}`}>{product.name}<ArrowUpRight aria-hidden="true" size={18}/></Link></h3><p>{product.description}</p></div></article> }
