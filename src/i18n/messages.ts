import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import zhCN from '@/i18n/messages/zh-CN.json'

import type { Locale } from '@/i18n/locales'

export type Messages = typeof en

const messages: Record<Locale, Messages> = {
  en,
  ja,
  'zh-CN': zhCN,
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  return messages[locale]
}
