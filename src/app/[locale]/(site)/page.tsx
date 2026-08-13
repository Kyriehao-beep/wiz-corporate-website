import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { loadMessages } from '@/i18n/messages'
import { HomePage } from '@/components/site/home-page'

type LocalePageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await loadMessages(locale)

  return <HomePage locale={locale} messages={messages} />
}
