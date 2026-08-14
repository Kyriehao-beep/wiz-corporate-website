import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  mapApplicationDetail,
  mapApplicationSummary,
  mapProductDetail,
  mapProductSummary,
  resolveCatalogTranslation,
  SupabaseCatalogRepository,
  type ApplicationRow,
  type ProductRow,
  type ProductTranslationRow,
} from './supabase-catalog-repository'

const jaEn: ProductTranslationRow[] = [
  {
    locale: 'ja', title: 'カスタムPVCラバーパッチ', summary: 'JA summary', body: 'JA body',
    seo_title: '', seo_description: '', approved: true, fallback_to_en: false,
    eyebrow: 'JA eyebrow', suitability: ['JA suit 1'], construction: ['JA cons 1'],
    visual_options: ['JA vis 1'], attachment_options: ['JA att 1'], artwork_guidance: 'JA guidance',
  },
  {
    locale: 'en', title: 'Custom PVC Rubber Patches', summary: 'EN summary', body: 'EN body',
    seo_title: '', seo_description: '', approved: true, fallback_to_en: false,
    eyebrow: 'EN eyebrow', suitability: ['EN suit 1'], construction: ['EN cons 1'],
    visual_options: ['EN vis 1'], attachment_options: ['EN att 1'], artwork_guidance: 'EN guidance',
  },
]

describe('resolveCatalogTranslation', () => {
  it('returns the requested locale without fallback when present and approved', () => {
    const { translation, usedFallback } = resolveCatalogTranslation(jaEn, 'ja')
    expect(usedFallback).toBe(false)
    expect(translation?.title).toBe('カスタムPVCラバーパッチ')
  })

  it('falls back to English when the requested locale is missing', () => {
    const { translation, usedFallback } = resolveCatalogTranslation(jaEn, 'zh-CN')
    expect(usedFallback).toBe(true)
    expect(translation?.title).toBe('Custom PVC Rubber Patches')
  })

  it('falls back to English and hides a draft (unapproved) requested translation', () => {
    const rows: ProductTranslationRow[] = [
      { locale: 'ja', title: 'JA draft', summary: '', body: '', seo_title: '', seo_description: '', approved: false, fallback_to_en: false, eyebrow: '', suitability: [], construction: [], visual_options: [], attachment_options: [], artwork_guidance: '' },
      { locale: 'en', title: 'EN published', summary: '', body: '', seo_title: '', seo_description: '', approved: true, fallback_to_en: false, eyebrow: '', suitability: [], construction: [], visual_options: [], attachment_options: [], artwork_guidance: '' },
    ]
    const { translation, usedFallback } = resolveCatalogTranslation(rows, 'ja')
    expect(usedFallback).toBe(true)
    expect(translation?.title).toBe('EN published')
  })

  it('returns null when no translation exists at all', () => {
    const { translation, usedFallback } = resolveCatalogTranslation([], 'en')
    expect(translation).toBeNull()
    expect(usedFallback).toBe(false)
  })
})

describe('mapProductSummary', () => {
  it('maps DB columns to the public summary shape', () => {
    const row: ProductRow = {
      id: 'p1', slug: 'custom-pvc-rubber-patches', status: 'published', display_order: 1, tone: 'lime',
      product_translations: jaEn,
    }
    const summary = mapProductSummary(row, jaEn[0])
    expect(summary).toEqual({
      slug: 'custom-pvc-rubber-patches',
      name: 'カスタムPVCラバーパッチ',
      eyebrow: 'JA eyebrow',
      description: 'JA summary',
      index: '01',
      tone: 'lime',
    })
  })
})

describe('mapProductDetail', () => {
  const baseRow: ProductRow = {
    id: 'p1', slug: 'custom-pvc-rubber-patches', status: 'published', display_order: 1, tone: 'lime',
    product_translations: jaEn, product_applications: [],
  }

  it('reads editorial arrays from the translation row', () => {
    const detail = mapProductDetail(baseRow, jaEn[0])
    expect(detail.eyebrow).toBe('JA eyebrow')
    expect(detail.suitability).toEqual(['JA suit 1'])
    expect(detail.construction).toEqual(['JA cons 1'])
    expect(detail.visualOptions).toEqual(['JA vis 1'])
    expect(detail.attachmentOptions).toEqual(['JA att 1'])
  })

  it('prefers artwork_guidance but falls back to body when guidance is empty', () => {
    const withGuidance = mapProductDetail(baseRow, { ...jaEn[0], artwork_guidance: 'Explicit guidance' })
    expect(withGuidance.artworkGuidance).toBe('Explicit guidance')

    const fallback = mapProductDetail(baseRow, { ...jaEn[0], artwork_guidance: '' })
    expect(fallback.artworkGuidance).toBe('JA body')
  })
})

describe('mapApplicationSummary', () => {
  it('maps DB columns to the public application summary shape', () => {
    const row: ApplicationRow = {
      id: 'a1', slug: 'apparel', display_order: 3, tone: 'ocean', priority: true,
      application_translations: [
        { locale: 'en', title: 'Apparel', summary: 'Apparel summary', body: '', seo_title: '', seo_description: '', buyer_problem: '', attachment_considerations: '', visual_direction: '' },
      ],
    }
    const summary = mapApplicationSummary(row, row.application_translations[0])
    expect(summary.name).toBe('Apparel')
    expect(summary.index).toBe('03')
    expect(summary.priority).toBe(true)
    expect(summary.tone).toBe('ocean')
  })
})

describe('mapApplicationDetail', () => {
  it('reads editorial fields and derives recommended product slugs via the products join', () => {
    const tr = {
      locale: 'en' as const, title: 'Apparel', summary: 'Apparel summary', body: 'BP fallback',
      seo_title: '', seo_description: '', buyer_problem: 'BP', attachment_considerations: 'AC', visual_direction: 'VD',
    }
    const row: ApplicationRow = {
      id: 'a1', slug: 'apparel', display_order: 1, tone: 'ocean', priority: true,
      application_translations: [tr],
      product_applications: [{ products: { slug: 'custom-pvc-rubber-patches' } }, { products: null }],
    }
    const detail = mapApplicationDetail(row, tr)
    expect(detail.buyerProblem).toBe('BP')
    expect(detail.attachmentConsiderations).toBe('AC')
    expect(detail.visualDirection).toBe('VD')
    expect(detail.recommendedProductSlugs).toEqual(['custom-pvc-rubber-patches'])
  })
})

// ── Fake Supabase client ────────────────────────────────────────────────────
class FakeBuilder {
  constructor(private readonly rows: unknown | null) {}
  select() { return this }
  eq() { return this }
  order() { return this }
  maybeSingle() { return this }
  then<T>(resolve: (r: { data: unknown; error: unknown }) => T): Promise<T> {
    return Promise.resolve(resolve({ data: this.rows, error: null }))
  }
}

function fakeClient(productRows: unknown[] | unknown | null): SupabaseClient {
  const builder = new FakeBuilder(productRows)
  const from = vi.fn(() => builder)
  return { from } as unknown as SupabaseClient
}

describe('SupabaseCatalogRepository', () => {
  const productRow: ProductRow = {
    id: 'p1', slug: 'custom-pvc-rubber-patches', status: 'published', display_order: 1, tone: 'lime',
    product_translations: jaEn, product_applications: [],
  }

  it('lists published products in the requested locale', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient([productRow]))
    const products = await repo.listProducts('ja')
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('カスタムPVCラバーパッチ')
    expect(products[0].eyebrow).toBe('JA eyebrow')
    expect(products[0].tone).toBe('lime')
  })

  it('returns null for an unknown slug', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient(null))
    expect(await repo.getProductBySlug('en', 'does-not-exist')).toBeNull()
  })

  it('getProductBySlug falls back to English for a missing locale and reads editorial arrays', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient(productRow))
    const detail = await repo.getProductBySlug('zh-CN', 'custom-pvc-rubber-patches')
    expect(detail).not.toBeNull()
    expect(detail?.name).toBe('Custom PVC Rubber Patches')
    expect(detail?.suitability).toEqual(['EN suit 1'])
    expect(detail?.visualOptions).toEqual(['EN vis 1'])
    expect(detail?.artworkGuidance).toBe('EN guidance')
  })

  it('getApplicationBySlug returns editorial fields and derived product slugs', async () => {
    const appRow: ApplicationRow = {
      id: 'a1', slug: 'apparel', display_order: 1, tone: 'ocean', priority: true,
      application_translations: [{
        locale: 'en', title: 'Apparel', summary: 'Apparel summary', body: 'fallback',
        seo_title: '', seo_description: '', buyer_problem: 'BP', attachment_considerations: 'AC', visual_direction: 'VD',
      }],
      product_applications: [{ products: { slug: 'custom-pvc-rubber-patches' } }],
    }
    const repo = new SupabaseCatalogRepository(fakeClient(appRow))
    const detail = await repo.getApplicationBySlug('en', 'apparel')
    expect(detail).not.toBeNull()
    expect(detail?.name).toBe('Apparel')
    expect(detail?.priority).toBe(true)
    expect(detail?.tone).toBe('ocean')
    expect(detail?.buyerProblem).toBe('BP')
    expect(detail?.attachmentConsiderations).toBe('AC')
    expect(detail?.visualDirection).toBe('VD')
    expect(detail?.recommendedProductSlugs).toEqual(['custom-pvc-rubber-patches'])
  })
})
