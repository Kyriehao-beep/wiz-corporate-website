import { notFound } from 'next/navigation'
import { ProductGrid } from '@/features/catalog/product-grid'
import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'
import { Container } from '@/components/ui/container'
import { isLocale } from '@/i18n/locales'
export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const products = await fixtureCatalogRepository.listProducts(locale); return <main id="main-content" className="listing-page"><Container><p className="eyebrow">Product families</p><h1>Rubber patch formats for real product construction.</h1><p className="page-lead">Choose a starting format, then refine material, relief, color, and attachment around your application.</p><ProductGrid products={products} locale={locale}/></Container></main> }
