import type { ReactNode } from 'react'
import { setRequestLocale } from 'next-intl/server'

import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { MotionLayer } from '@/components/site/motion-layer'
import { loadMessages } from '@/i18n/messages'
import type { Locale } from '@/i18n/locales'

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await loadMessages(locale as Locale)

  return (
    <>
      <MotionLayer />
      <SiteHeader locale={locale as Locale} />
      {children}
      <SiteFooter locale={locale as Locale} messages={messages} />
    </>
  )
}
