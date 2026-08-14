import { notFound } from 'next/navigation'
import { productFixtures } from '@/features/catalog/fixtures'
import { getCatalogRepository } from '@/features/catalog/get-catalog-repository'
import { ProductDetailPage } from '@/features/catalog/product-detail-page'
import { isLocale, locales } from '@/i18n/locales'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

// Render on demand from the configured catalog repository (Supabase in
// preview/production; fixtures are for local visual recovery only). Skips
// build-time prerender so `next build` never requires a live database.
export const dynamic = 'force-dynamic'

export function generateStaticParams() { return locales.flatMap((locale) => productFixtures.map(({ slug }) => ({ locale, slug }))) }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const product = await (await getCatalogRepository()).getProductBySlug(locale, slug); return product ? buildMetadata(locale, `/products/${slug}`, product.name, product.description) : {} }
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const product = await (await getCatalogRepository()).getProductBySlug(locale, slug); if (!product) notFound(); return <ProductDetailPage locale={locale} product={product}/> }
