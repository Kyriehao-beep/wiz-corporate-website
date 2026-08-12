import { ArrowUpRight } from 'lucide-react'
import type { ProductSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
export function ProductCard({ product, locale }: { product: ProductSummary; locale: Locale }) { return <article className={`catalog-card catalog-card--${product.tone}`}><div className="catalog-card__top"><span>{product.index}</span><span>{product.eyebrow}</span></div><div className="catalog-card__shape" aria-hidden="true"><span>W</span></div><div><h3><a href={`/${locale}/products/${product.slug}`}>{product.name}<ArrowUpRight aria-hidden="true" size={18}/></a></h3><p>{product.description}</p></div></article> }
