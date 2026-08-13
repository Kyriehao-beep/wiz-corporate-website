import { notFound } from 'next/navigation'
import { AboutPage } from '@/components/site/support-pages'
import { isLocale } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'
export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }) => metadataForStaticPage(params, '/about', 'About WIZ')
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <AboutPage locale={locale}/> }
