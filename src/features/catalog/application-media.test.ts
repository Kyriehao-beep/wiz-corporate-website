import { describe, expect, it } from 'vitest'

import { getApplicationMedia } from '@/features/catalog/application-media'
import { applicationFixtures } from '@/features/catalog/fixtures'

describe('application media', () => {
  it('provides public-safe visual media for every catalog application', () => {
    const expectedSlugs = [
      'surf-watersports',
      'outdoor-apparel',
      'backpacks-gear-bags',
      'tactical-uniforms',
      'footwear',
      'workwear',
      'clubs-events',
      'promotional-merchandise',
      'marine-equipment',
    ]

    expect(applicationFixtures.map(({ slug }) => slug)).toEqual(expectedSlugs)
    for (const slug of expectedSlugs) {
      const media = getApplicationMedia(slug, 'en')
      expect(media.src).toBe(`/media/drafts/application-${slug}.png`)
      expect(media.alt).not.toMatch(/\bAI\b|AI DRAFT|draft visual/i)
      expect(media.alt.length).toBeGreaterThan(20)
      expect(media.objectPosition).toMatch(/%/)
    }
  })

  it('returns localized alternative text', () => {
    expect(getApplicationMedia('outdoor-apparel', 'ja').alt).toContain('アウトドア')
    expect(getApplicationMedia('outdoor-apparel', 'zh-CN').alt).toContain('户外')
  })
})
