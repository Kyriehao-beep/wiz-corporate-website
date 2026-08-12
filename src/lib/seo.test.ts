import { describe, expect, it } from 'vitest'
import { buildLocaleAlternates, siteUrl } from '@/lib/seo'

describe('SEO contracts', () => {
  it('builds canonical and all approved language alternates', () => {
    const result = buildLocaleAlternates('en', '/products')
    expect(result.canonical).toBe(`${siteUrl}/en/products`)
    expect(result.languages).toMatchObject({ en: `${siteUrl}/en/products`, ja: `${siteUrl}/ja/products`, 'zh-CN': `${siteUrl}/zh-CN/products`, 'x-default': `${siteUrl}/en/products` })
  })
})
