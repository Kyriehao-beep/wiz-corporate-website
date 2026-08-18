import { notFound } from 'next/navigation'
import { ApplicationGrid } from '@/features/catalog/application-grid'
import { getCatalogRepository } from '@/features/catalog/get-catalog-repository'
import { Container } from '@/components/ui/container'
import { isLocale, locales } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'

// Statically prerender all locales from the fixture catalog (no DB needed).
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }) => metadataForStaticPage(params, '/applications', 'Applications')
export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const applications = await (await getCatalogRepository()).listApplications(locale); return <main id="main-content" className="listing-page"><Container><p className="eyebrow">Use environments</p><h1>Start with where and how the patch will be used.</h1><p className="page-lead">Substrate, flex, exposure, and attachment shape the right construction. Explore the closest application and bring us the remaining variables.</p><ApplicationGrid applications={applications} locale={locale}/></Container></main> }
