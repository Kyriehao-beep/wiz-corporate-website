import { notFound } from 'next/navigation'
import { ProductGrid } from '@/features/catalog/product-grid'
import { getCatalogRepository } from '@/features/catalog/get-catalog-repository'
import { Container } from '@/components/ui/container'
import { isLocale, locales } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'

// Statically prerender all locales from the fixture catalog (no DB needed).
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }) => metadataForStaticPage(params, '/products', 'Products')
export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const products = await (await getCatalogRepository()).listProducts(locale); return <main id="main-content" className="listing-page"><Container><p className="eyebrow">Product families</p><h1>Rubber patch formats for real product construction.</h1><p className="page-lead">Choose a starting format, then refine material, relief, color, and attachment around your application.</p><ProductGrid products={products} locale={locale}/></Container></main> }
