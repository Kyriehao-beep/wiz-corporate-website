import type { SupabaseClient } from '@supabase/supabase-js'
import type { CatalogRepository, ApplicationDetail, ApplicationSummary, ProductDetail, ProductMedia, ProductSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Supabase-backed implementation of `CatalogRepository` (Plan Task 3).
 *
 * Row shapes mirror `supabase/migrations/202608120001_core_schema.sql` +
 * `202608130001_catalog_editorial_fields.sql` + `seed.sql`. The rich editorial
 * fields (eyebrow, tone, suitability, construction, visualOptions,
 * attachmentOptions, artworkGuidance, buyerProblem, recommendedProductSlugs,
 * attachmentConsiderations, visualDirection, priority) are now modelled in the
 * schema — per-language content lives on the `*_translations` tables, while the
 * language-neutral `tone` / `priority` live on the base tables. The pure logic
 * (locale fallback + mapping) is fully unit-tested; the live query round-trip
 * is verified when the database is brought up via the local Supabase runbook.
 */

export interface ProductTranslationRow {
  locale: Locale
  title: string
  summary: string
  body: string
  seo_title: string
  seo_description: string
  approved: boolean
  fallback_to_en: boolean
  eyebrow: string
  suitability: string[]
  construction: string[]
  visual_options: string[]
  attachment_options: string[]
  artwork_guidance: string
}

export interface ProductRow {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  display_order: number
  tone: string
  product_translations: ProductTranslationRow[]
  product_applications?: Array<{ applications?: { slug: string } | null }>
}

export interface ApplicationTranslationRow {
  locale: Locale
  title: string
  summary: string
  body: string
  seo_title: string
  seo_description: string
  buyer_problem: string
  attachment_considerations: string
  visual_direction: string
}

export interface ApplicationRow {
  id: string
  slug: string
  display_order: number
  tone: string
  priority: boolean
  application_translations: ApplicationTranslationRow[]
  product_applications?: Array<{ products?: { slug: string } | null }>
}

/** Pure locale resolution: requested locale if approved, else English fallback. */
export function resolveCatalogTranslation<T extends { locale: Locale; approved?: boolean }>(
  translations: T[],
  requested: Locale,
): { translation: T | null; usedFallback: boolean } {
  const requestedRow = translations.find((t) => t.locale === requested && t.approved !== false)
  if (requestedRow) return { translation: requestedRow, usedFallback: false }
  const enRow = translations.find((t) => t.locale === 'en')
  if (enRow) return { translation: enRow, usedFallback: true }
  return { translation: translations[0] ?? null, usedFallback: translations.length > 0 }
}

export function mapProductSummary(row: ProductRow, tr: ProductTranslationRow): ProductSummary {
  return {
    slug: row.slug,
    name: tr.title,
    eyebrow: tr.eyebrow,
    description: tr.summary,
    index: String(row.display_order).padStart(2, '0'),
    tone: row.tone,
    image: deriveProductMedia(row.slug),
  }
}

/** Derive product media from slug convention (matches fixtures.ts productImage helper). */
function deriveProductMedia(slug: string): ProductMedia {
  const altMap: Record<string, { en: string; ja: string; 'zh-CN': string }> = {
    'heat-transfer-rubber-patches': { en: 'Heat transfer silicone labels in black and red showing LOVE ENERGY branding with feature icons', ja: '熱転写シリコンラベル、黒と赤のLOVE ENERGYブランディング', 'zh-CN': '热转印硅胶标（黑红双色 LOVE ENERGY 品牌）' },
    'custom-pvc-rubber-patches': { en: 'Custom PVC rubber patches in various shapes displayed on canvas fabric', ja: '様々な形状のカスタムPVCラバーパッチをキャンバス生地に展示', 'zh-CN': '多种形状的定制 PVC 橡胶标牌，展示于帆布面料上' },
    'hook-and-loop-rubber-patches': { en: 'Hook-and-loop PVC rubber patches — triangular symbol, helicopter patch, and detail shots', ja: '面ファスナーPVCラバーパッチ — 三角シンボル、ヘリコプターパッチ', 'zh-CN': '魔术贴 PVC 橡胶标牌——三角符号、直升机造型及细节图' },
    'earphone-hole-patches': { en: 'PVC headphone port patches with cable pass-through on tactical bag', ja: 'PVCイヤホン穴パッチ、ケーブル通し付きでタクティカルバッグに装着', 'zh-CN': 'PVC 耳机孔标牌（带线缆过孔），展示于战术背包' },
    'keychains': { en: 'Colorful custom PVC keychains hanging from carabiner on outdoor gear', ja: 'カラフルなカスタムPVCキーホルダーをアウトドアギアに装着', 'zh-CN': '多彩定制 PVC 钥匙扣，挂于户外装备登山扣上' },
  }
  const opMap: Record<string, string> = {
    'heat-transfer-rubber-patches': '50% 50%',
    'custom-pvc-rubber-patches': '55% 45%',
    'hook-and-loop-rubber-patches': '50% 42%',
    'earphone-hole-patches': '45% 35%',
    'keychains': '50% 28%',
  }
  const alt = altMap[slug] ?? altMap['custom-pvc-rubber-patches']!
  return {
    src: `/media/drafts/product-${slug}.jpg`,
    alt: { en: alt.en, ja: alt.ja, 'zh-CN': alt['zh-CN'] },
    objectPosition: opMap[slug] ?? '50% 50%',
  }
}

export function mapProductDetail(
  row: ProductRow,
  tr: ProductTranslationRow,
): ProductDetail {
  return {
    ...mapProductSummary(row, tr),
    suitability: tr.suitability,
    construction: tr.construction,
    visualOptions: tr.visual_options,
    attachmentOptions: tr.attachment_options,
    // Backward-compatible fallback: before artwork_guidance was populated,
    // body carried the guidance copy. Prefer the dedicated column when present.
    artworkGuidance: tr.artwork_guidance || tr.body,
    applicationSlugs: (row.product_applications ?? [])
      .map((a) => a.applications?.slug)
      .filter((slug): slug is string => typeof slug === 'string'),
    image: deriveProductMedia(row.slug),
  }
}

export function mapApplicationSummary(
  row: ApplicationRow,
  tr: ApplicationTranslationRow,
): ApplicationSummary {
  return {
    slug: row.slug,
    name: tr.title,
    description: tr.summary,
    priority: row.priority,
    index: String(row.display_order).padStart(2, '0'),
    tone: row.tone,
  }
}

export function mapApplicationDetail(
  row: ApplicationRow,
  tr: ApplicationTranslationRow,
): ApplicationDetail {
  return {
    ...mapApplicationSummary(row, tr),
    buyerProblem: tr.buyer_problem,
    recommendedProductSlugs: (row.product_applications ?? [])
      .map((p) => p.products?.slug)
      .filter((slug): slug is string => typeof slug === 'string'),
    attachmentConsiderations: tr.attachment_considerations,
    visualDirection: tr.visual_direction,
  }
}

export class SupabaseCatalogRepository implements CatalogRepository {
  private readonly clientFactory: () => Promise<SupabaseClient>

  /** Pass a client for tests; omit to lazily use the SSR server client. */
  constructor(client?: SupabaseClient) {
    this.clientFactory = client ? async () => client : createServerClient
  }

  private async getClient(): Promise<SupabaseClient> {
    return this.clientFactory()
  }

  async listProducts(locale: Locale): Promise<ProductSummary[]> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('products')
      .select('id, slug, status, display_order, tone, product_translations(locale, title, summary, eyebrow, approved, fallback_to_en)')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
    if (error) throw new Error(`products query failed: ${error.message}`)
    const rows = (data ?? []) as unknown as ProductRow[]
    return rows
      .map((row) => {
        const { translation } = resolveCatalogTranslation(row.product_translations, locale)
        return translation ? mapProductSummary(row, translation) : null
      })
      .filter((x): x is ProductSummary => x !== null)
  }

  async getProductBySlug(locale: Locale, slug: string): Promise<ProductDetail | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('products')
      .select('id, slug, status, display_order, tone, product_translations(*), product_applications(applications(slug))')
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new Error(`product query failed: ${error.message}`)
    if (!data) return null
    const row = data as unknown as ProductRow
    const { translation } = resolveCatalogTranslation(row.product_translations, locale)
    if (!translation) return null
    return mapProductDetail(row, translation)
  }

  async listApplications(locale: Locale): Promise<ApplicationSummary[]> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('applications')
      .select('id, slug, display_order, tone, priority, application_translations(locale, title, summary)')
      .order('display_order', { ascending: true })
    if (error) throw new Error(`applications query failed: ${error.message}`)
    const rows = (data ?? []) as unknown as ApplicationRow[]
    return rows
      .map((row) => {
        const { translation } = resolveCatalogTranslation(row.application_translations, locale)
        return translation ? mapApplicationSummary(row, translation) : null
      })
      .filter((x): x is ApplicationSummary => x !== null)
  }

  async getApplicationBySlug(locale: Locale, slug: string): Promise<ApplicationDetail | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('applications')
      .select('id, slug, display_order, tone, priority, application_translations(*), product_applications(products!product_applications_product_id_fkey(slug))')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new Error(`application query failed: ${error.message}`)
    if (!data) return null
    const row = data as unknown as ApplicationRow
    const { translation } = resolveCatalogTranslation(row.application_translations, locale)
    if (!translation) return null
    return mapApplicationDetail(row, translation)
  }
}
