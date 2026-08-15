import { describe, expect, it } from 'vitest'

import { getApplicationMedia } from '@/features/catalog/application-media'
import { applicationFixtures } from '@/features/catalog/fixtures'

describe('application media', () => {
  it('provides public-safe visual media for every catalog application', () => {
    const expectedSlugs = [
      'outdoor-apparel',
      'yoga-wear',
      'surf-watersports',
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
      expect(media.src).toMatch(new RegExp(`^/media/drafts/application-${slug}\\.(png|jpg)$`))
      expect(media.alt.en).not.toMatch(/\bAI\b|AI DRAFT|draft visual/i)
      expect(media.alt.en.length).toBeGreaterThan(20)
      expect(media.objectPosition).toMatch(/%/)
    }
  })

  it('returns localized alternative text', () => {
    expect(getApplicationMedia('outdoor-apparel', 'ja').alt.ja).toContain('アウトドア')
    expect(getApplicationMedia('outdoor-apparel', 'zh-CN').alt['zh-CN']).toContain('户外')
  })

  it('returns a safe fallback for unknown slugs instead of throwing', () => {
    const media = getApplicationMedia('nonexistent-slug', 'en')
    expect(media.src).toBe('/media/drafts/application-placeholder.png')
    expect(media.alt.en).toContain('coming soon')
    expect(media.objectPosition).toBe('50% 50%')
  })
})
