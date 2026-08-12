import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/site/support-pages'
import { isLocale } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'
export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }) => metadataForStaticPage(params, '/terms', 'Website Terms')
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <LegalPage kind="terms" locale={locale}/> }
