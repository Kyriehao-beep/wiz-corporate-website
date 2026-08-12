import { notFound } from 'next/navigation'
import { productFixtures } from '@/features/catalog/fixtures'
import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'
import { ProductDetailPage } from '@/features/catalog/product-detail-page'
import { isLocale, locales } from '@/i18n/locales'

export function generateStaticParams() { return locales.flatMap((locale) => productFixtures.map(({ slug }) => ({ locale, slug }))) }
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const product = await fixtureCatalogRepository.getProductBySlug(locale, slug); if (!product) notFound(); return <ProductDetailPage locale={locale} product={product}/> }
