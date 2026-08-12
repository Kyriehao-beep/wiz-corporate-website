import type { Locale } from '@/i18n/locales'

export type RfqLinkContext = { locale: Locale; product?: string; application?: string; source?: string }

export function buildRfqUrl(input: RfqLinkContext): string {
  const query = new URLSearchParams()
  if (input.product) query.set('product', input.product)
  if (input.application) query.set('application', input.application)
  if (input.source) query.set('source', input.source)
  return `/${input.locale}/rfq${query.size ? `?${query.toString()}` : ''}`
}
