import { ProductCard } from '@/features/catalog/product-card'
import type { ProductSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
export function ProductGrid({ products, locale }: { products: ProductSummary[]; locale: Locale }) { return <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} locale={locale}/>)}</div> }
