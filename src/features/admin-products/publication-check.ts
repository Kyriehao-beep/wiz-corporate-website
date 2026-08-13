export type TranslationLocale = 'en' | 'ja' | 'zh-CN'

export interface ProductTranslationInput {
  locale: TranslationLocale
  title: string
  summary: string
  approved: boolean
}

export interface ProductForPublication {
  translations: ProductTranslationInput[]
  /** When true, a missing Japanese translation falls back to English at render time. */
  allowEnglishFallbackJa?: boolean
  /** When true, a missing Simplified-Chinese translation falls back to English at render time. */
  allowEnglishFallbackZh?: boolean
}

const LABEL: Record<Exclude<TranslationLocale, 'en'>, string> = {
  ja: 'Japanese',
  'zh-CN': 'Chinese',
}

/**
 * Returns human-readable publication blockers. Empty array means the product may be published.
 * English is the mandatory baseline; non-English locales may either supply their own content
 * or explicitly opt into English fallback.
 */
export function getPublicationIssues(product: ProductForPublication): string[] {
  const issues: string[] = []

  const en = product.translations.find((t) => t.locale === 'en')
  if (!en || !en.title.trim() || !en.summary.trim()) {
    return ['English title and summary are required']
  }

  const ja = product.translations.find((t) => t.locale === 'ja')
  const zh = product.translations.find((t) => t.locale === 'zh-CN')

  if (!ja && !product.allowEnglishFallbackJa) {
    issues.push('Japanese translation is required or enable English fallback')
  }
  if (!zh && !product.allowEnglishFallbackZh) {
    issues.push('Chinese translation is required or enable English fallback')
  }

  for (const translation of [ja, zh].filter(Boolean) as ProductTranslationInput[]) {
    if (!translation.title.trim() || !translation.summary.trim()) {
      issues.push(`${LABEL[translation.locale as Exclude<TranslationLocale, 'en'>]} title and summary are required`)
    }
  }

  return issues
}
