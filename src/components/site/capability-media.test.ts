import { describe, expect, it } from 'vitest'

import { getCapabilityMedia } from '@/components/site/capability-media'

describe('capability media contract', () => {
  it('defines four localized, publication-safe capability visuals', () => {
    for (const locale of ['en', 'ja', 'zh-CN'] as const) {
      const cards = getCapabilityMedia(locale)

      expect(cards.map(({ id }) => id)).toEqual(['factory', 'experience', 'color', 'production'])
      expect(cards).toHaveLength(4)
      expect(cards.every(({ src }) => src.startsWith('/media/drafts/capability-') && src.endsWith('.png'))).toBe(true)
      expect(cards.every(({ alt }) => alt.length > 0 && !/AI DRAFT|draft visual/i.test(alt))).toBe(true)
    }
  })
})
