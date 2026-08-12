import { expect, it } from 'vitest'

import { defaultLocale, isLocale, locales } from '@/i18n/locales'

it('accepts only the three approved website locales', () => {
  expect(locales).toEqual(['en', 'ja', 'zh-CN'])
  expect(defaultLocale).toBe('en')
  expect(isLocale('ja')).toBe(true)
  expect(isLocale('es')).toBe(false)
})
