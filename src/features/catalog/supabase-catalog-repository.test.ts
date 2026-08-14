import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  mapApplicationSummary,
  mapProductSummary,
  resolveCatalogTranslation,
  SupabaseCatalogRepository,
  type ApplicationRow,
  type ProductRow,
  type ProductTranslationRow,
} from './supabase-catalog-repository'

const jaEn: ProductTranslationRow[] = [
  { locale: 'ja', title: 'カスタムPVCラバーパッチ', summary: 'JA summary', body: 'JA body', seo_title: '', seo_description: '', approved: true, fallback_to_en: false },
  { locale: 'en', title: 'Custom PVC Rubber Patches', summary: 'EN summary', body: 'EN body', seo_title: '', seo_description: '', approved: true, fallback_to_en: false },
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
      { locale: 'ja', title: 'JA draft', summary: '', body: '', seo_title: '', seo_description: '', approved: false, fallback_to_en: false },
      { locale: 'en', title: 'EN published', summary: '', body: '', seo_title: '', seo_description: '', approved: true, fallback_to_en: false },
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
      id: 'p1', slug: 'custom-pvc-rubber-patches', status: 'published', display_order: 1,
      product_translations: jaEn,
    }
    const summary = mapProductSummary(row, jaEn[0])
    expect(summary).toEqual({
      slug: 'custom-pvc-rubber-patches',
      name: 'カスタムPVCラバーパッチ',
      eyebrow: '',
      description: 'JA summary',
      index: '01',
      tone: 'forest',
    })
  })
})

describe('mapApplicationSummary', () => {
  it('maps DB columns to the public application summary shape', () => {
    const row: ApplicationRow = {
      id: 'a1', slug: 'apparel', display_order: 3,
      application_translations: [
        { locale: 'en', title: 'Apparel', summary: 'Apparel summary', body: '', seo_title: '', seo_description: '' },
      ],
    }
    const summary = mapApplicationSummary(row, row.application_translations[0])
    expect(summary.name).toBe('Apparel')
    expect(summary.index).toBe('03')
    expect(summary.priority).toBe(false)
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
    id: 'p1', slug: 'custom-pvc-rubber-patches', status: 'published', display_order: 1,
    product_translations: jaEn, product_applications: [],
  }

  it('lists published products in the requested locale', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient([productRow]))
    const products = await repo.listProducts('ja')
    expect(products).toHaveLength(1)
    expect(products[0].name).toBe('カスタムPVCラバーパッチ')
  })

  it('returns null for an unknown slug', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient(null))
    expect(await repo.getProductBySlug('en', 'does-not-exist')).toBeNull()
  })

  it('getProductBySlug falls back to English for a missing locale', async () => {
    const repo = new SupabaseCatalogRepository(fakeClient(productRow))
    const detail = await repo.getProductBySlug('zh-CN', 'custom-pvc-rubber-patches')
    expect(detail).not.toBeNull()
    expect(detail?.name).toBe('Custom PVC Rubber Patches')
  })
})
