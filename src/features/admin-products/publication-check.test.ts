import { describe, expect, it } from 'vitest'
import { getPublicationIssues, type ProductForPublication } from './publication-check'

function withEnglish(overrides: Partial<ProductForPublication> = {}): ProductForPublication {
  return {
    translations: [
      { locale: 'en', title: 'PVC Rubber Patches', summary: 'Custom PVC rubber patches.', approved: true },
      { locale: 'ja', title: 'PVCラバーパッチ', summary: 'カスタムPVCラバーパッチ。', approved: true },
      { locale: 'zh-CN', title: 'PVC 橡胶标牌', summary: '定制 PVC 橡胶标牌。', approved: true },
    ],
    allowEnglishFallbackJa: false,
    allowEnglishFallbackZh: false,
    ...overrides,
  }
}

describe('getPublicationIssues', () => {
  it('blocks publication when English content is absent', () => {
    const product = withEnglish({
      translations: [
        { locale: 'ja', title: 'PVCラバーパッチ', summary: 'カスタムPVCラバーパッチ。', approved: true },
        { locale: 'zh-CN', title: 'PVC 橡胶标牌', summary: '定制 PVC 橡胶标牌。', approved: true },
      ],
    })
    expect(getPublicationIssues(product)).toContain('English title and summary are required')
  })

  it('allows explicit English fallback for Japanese and Chinese', () => {
    const product = withEnglish({
      translations: [{ locale: 'en', title: 'PVC Rubber Patches', summary: 'Custom PVC rubber patches.', approved: true }],
      allowEnglishFallbackJa: true,
      allowEnglishFallbackZh: true,
    })
    expect(getPublicationIssues(product)).toEqual([])
  })

  it('flags a present-but-empty Japanese translation when no fallback is set', () => {
    const product = withEnglish({
      translations: [
        { locale: 'en', title: 'PVC Rubber Patches', summary: 'Custom PVC rubber patches.', approved: true },
        { locale: 'ja', title: '', summary: '', approved: false },
        { locale: 'zh-CN', title: 'PVC 橡胶标牌', summary: '定制 PVC 橡胶标牌。', approved: true },
      ],
    })
    expect(getPublicationIssues(product)).toContain('Japanese title and summary are required')
  })
})
