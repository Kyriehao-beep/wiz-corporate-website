import { notFound } from 'next/navigation'
import { applicationFixtures } from '@/features/catalog/fixtures'
import { getCatalogRepository } from '@/features/catalog/get-catalog-repository'
import { ApplicationDetailPage } from '@/features/catalog/application-detail-page'
import { isLocale, locales } from '@/i18n/locales'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

// Statically prerender every (locale, slug) pair from the fixture catalog.
export function generateStaticParams() { return locales.flatMap((locale) => applicationFixtures.map(({ slug }) => ({ locale, slug }))) }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const application = await (await getCatalogRepository()).getApplicationBySlug(locale, slug); return application ? buildMetadata(locale, `/applications/${slug}`, application.name, application.description) : {} }
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const repo = await getCatalogRepository(); const application = await repo.getApplicationBySlug(locale, slug); if (!application) notFound(); const products = (await repo.listProducts(locale)).filter((item) => application.recommendedProductSlugs.includes(item.slug)); return <ApplicationDetailPage application={application} locale={locale} products={products}/> }
