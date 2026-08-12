'use client'

import { useLayoutEffect } from 'react'

import type { Locale } from '@/i18n/locales'

export function DocumentLanguage({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
