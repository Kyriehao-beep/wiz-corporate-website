import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

import { isLocale, locales } from '@/i18n/locales'
import { loadMessages } from '@/i18n/messages'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { MotionLayer } from '@/components/site/motion-layer'
import { SkipLink } from '@/components/ui/skip-link'
import { DocumentLanguage } from '@/components/site/document-language'
import { buildMetadata } from '@/lib/seo'

type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? buildMetadata(locale) : {}
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await loadMessages(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentLanguage locale={locale} />
      <SkipLink label={messages.common.skipToContent} />
      <MotionLayer />
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter locale={locale} messages={messages} />
    </NextIntlClientProvider>
  )
}
