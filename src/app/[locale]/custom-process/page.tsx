import { notFound } from 'next/navigation'
import { ProcessPage } from '@/components/site/support-pages'
import { isLocale } from '@/i18n/locales'
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <ProcessPage locale={locale}/> }
