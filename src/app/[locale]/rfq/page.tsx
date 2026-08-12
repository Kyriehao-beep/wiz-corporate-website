import { notFound } from 'next/navigation'
import { RfqPage } from '@/components/site/support-pages'
import { isLocale } from '@/i18n/locales'
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); const raw = await searchParams; const values = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])); return <RfqPage locale={locale} searchParams={values}/> }
