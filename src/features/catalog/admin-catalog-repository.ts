import type { SupabaseClient } from '@supabase/supabase-js'
import type { Locale } from '@/i18n/locales'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * Admin-side catalog repository (Plan Task 5 — backend CRUD).
 *
 * Writes go through the service-role client (`createServiceClient`) which BYPASSES
 * RLS, so this layer is only safe to call from guarded server code (server
 * actions that have already run `requireAdmin`). Reads for the public site must
 * keep using `SupabaseCatalogRepository` (anon client + RLS).
 *
 * The public schema is `supabase/migrations/202608120001_core_schema.sql` +
 * `202608130001_catalog_editorial_fields.sql`. Notable constraints:
 *   - `products.slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
 *   - `product_translations.locale` ∈ {en, ja, zh-CN}, `title`/`summary` NOT NULL
 *   - `product_applications(product_id, application_id)` is a composite PK with
 *     ON DELETE CASCADE from both sides
 */

export const ADMIN_LOCALES: Locale[] = ['en', 'ja', 'zh-CN']

// ── Errors ────────────────────────────────────────────────────────────────────
export class ProductRepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ProductRepositoryError'
  }
}

export class ProductNotFoundError extends ProductRepositoryError {
  constructor(slug: string) {
    super(`Product not found: ${slug}`)
    this.name = 'ProductNotFoundError'
  }
}

// ── Input / output types ───────────────────────────────────────────────────────
export interface ProductTranslationInput {
  title: string
  summary: string
  body: string
  seoTitle: string
  seoDescription: string
  eyebrow: string
  suitability: string[]
  construction: string[]
  visualOptions: string[]
  attachmentOptions: string[]
  artworkGuidance: string
  approved: boolean
  fallbackToEn: boolean
}

export interface ProductWriteInput {
  slug: string
  status: 'draft' | 'published' | 'archived'
  tone: string
  displayOrder: number
  translations: Partial<Record<Locale, ProductTranslationInput>>
  applicationSlugs: string[]
}

export interface AdminProductRow {
  id: string
  slug: string
  name: string
  status: 'draft' | 'published' | 'archived'
  tone: string
  displayOrder: number
  updatedAt: string
  locales: Record<Locale, { title: string; approved: boolean } | null>
  applicationSlugs: string[]
}

export interface ProductEditModel {
  slug: string
  status: 'draft' | 'published' | 'archived'
  tone: string
  displayOrder: number
  translations: Record<Locale, ProductTranslationInput>
  applicationSlugs: string[]
}

// ── Pure helpers (unit-tested) ─────────────────────────────────────────────────
const EMPTY_TRANSLATION: ProductTranslationInput = {
  title: '',
  summary: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  eyebrow: '',
  suitability: [],
  construction: [],
  visualOptions: [],
  attachmentOptions: [],
  artworkGuidance: '',
  approved: false,
  fallbackToEn: false,
}

export function emptyTranslation(): ProductTranslationInput {
  return { ...EMPTY_TRANSLATION }
}

/** DB column names for a product_translations row (snake_case). */
function translationColumns(t: ProductTranslationInput) {
  return {
    title: t.title,
    summary: t.summary,
    body: t.body,
    seo_title: t.seoTitle,
    seo_description: t.seoDescription,
    eyebrow: t.eyebrow,
    suitability: t.suitability,
    construction: t.construction,
    visual_options: t.visualOptions,
    attachment_options: t.attachmentOptions,
    artwork_guidance: t.artworkGuidance,
    approved: t.approved,
    fallback_to_en: t.fallbackToEn,
  }
}

// ── Row shapes for the admin queries ────────────────────────────────────────────
interface AdminProductListRow {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  display_order: number
  tone: string
  updated_at: string
  product_translations: Array<{
    locale: Locale
    title: string
    approved: boolean
  }>
  product_applications?: Array<{ applications?: { slug: string } | null }>
}

interface ProductEditTranslationRow {
  locale: Locale
  title: string
  summary: string
  body: string
  seo_title: string
  seo_description: string
  eyebrow: string
  suitability: string[]
  construction: string[]
  visual_options: string[]
  attachment_options: string[]
  artwork_guidance: string
  approved: boolean
  fallback_to_en: boolean
}

interface ProductEditApplicationRow {
  applications?: { slug: string } | null
}

// ── Repository ──────────────────────────────────────────────────────────────────
export class SupabaseAdminCatalogRepository {
  private readonly clientFactory: () => SupabaseClient

  /** Pass a client for tests; omit to use the privileged service client. */
  constructor(client?: SupabaseClient) {
    this.clientFactory = client ? () => client : createServiceClient
  }

  private getClient(): SupabaseClient {
    return this.clientFactory()
  }

  /** All products regardless of status — for the admin console table. */
  async listProductsAdmin(): Promise<AdminProductRow[]> {
    const client = this.getClient()
    const { data, error } = await client
      .from('products')
      .select(
        'id, slug, status, display_order, tone, updated_at, ' +
          'product_translations(locale, title, approved), ' +
          'product_applications(applications(slug))',
      )
      .order('display_order', { ascending: true })
    if (error) throw new ProductRepositoryError(`products list failed: ${error.message}`, error)

    const rows = (data ?? []) as unknown as AdminProductListRow[]
    return rows.map((row) => mapAdminProductRow(row))
  }

  /** Full editable model for the edit form (defaults missing locales). */
  async getProductForEdit(slug: string): Promise<ProductEditModel | null> {
    const client = this.getClient()
    const { data, error } = await client
      .from('products')
      .select('id, slug, status, display_order, tone')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new ProductRepositoryError(`product lookup failed: ${error.message}`, error)
    if (!data) return null

    const base = data as { id: string; slug: string; status: AdminProductRow['status']; display_order: number; tone: string }

    const { data: trs, error: trErr } = await client
      .from('product_translations')
      .select('locale, title, summary, body, seo_title, seo_description, eyebrow, suitability, construction, visual_options, attachment_options, artwork_guidance, approved, fallback_to_en')
      .eq('product_id', base.id)
    if (trErr) throw new ProductRepositoryError(`translations lookup failed: ${trErr.message}`, trErr)

    const { data: apps, error: appErr } = await client
      .from('product_applications')
      .select('applications(slug)')
      .eq('product_id', base.id)
    if (appErr) throw new ProductRepositoryError(`applications lookup failed: ${appErr.message}`, appErr)

    const translations = {} as Record<Locale, ProductTranslationInput>
    for (const locale of ADMIN_LOCALES) {
      const found = (trs ?? []).find((t) => t.locale === locale) as ProductEditTranslationRow | undefined
      translations[locale] = found
        ? {
            title: found.title,
            summary: found.summary,
            body: found.body,
            seoTitle: found.seo_title,
            seoDescription: found.seo_description,
            eyebrow: found.eyebrow,
            suitability: found.suitability ?? [],
            construction: found.construction ?? [],
            visualOptions: found.visual_options ?? [],
            attachmentOptions: found.attachment_options ?? [],
            artworkGuidance: found.artwork_guidance,
            approved: found.approved,
            fallbackToEn: found.fallback_to_en,
          }
        : { ...EMPTY_TRANSLATION }
    }

    const applicationSlugs = ((apps ?? []) as unknown as ProductEditApplicationRow[])
      .map((a) => a.applications?.slug)
      .filter((s): s is string => typeof s === 'string')

    return {
      slug: base.slug,
      status: base.status,
      tone: base.tone,
      displayOrder: base.display_order,
      translations,
      applicationSlugs,
    }
  }

  async createProduct(input: ProductWriteInput, editorId?: string): Promise<string> {
    const client = this.getClient()
    const id = crypto.randomUUID()

    const { error: prodErr } = await client.from('products').insert({
      id,
      slug: input.slug,
      status: input.status,
      tone: input.tone,
      display_order: input.displayOrder,
      created_by: editorId ?? null,
      updated_by: editorId ?? null,
    })
    if (prodErr) throw new ProductRepositoryError(`product insert failed: ${prodErr.message}`, prodErr)

    await this.upsertTranslations(client, id, input.translations)
    await this.syncApplicationLinks(client, id, input.applicationSlugs)

    return id
  }

  async updateProduct(slug: string, input: ProductWriteInput, editorId?: string): Promise<void> {
    const client = this.getClient()
    const id = await this.resolveProductId(client, slug)

    const { error: prodErr } = await client
      .from('products')
      .update({
        slug: input.slug,
        status: input.status,
        tone: input.tone,
        display_order: input.displayOrder,
        updated_by: editorId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (prodErr) throw new ProductRepositoryError(`product update failed: ${prodErr.message}`, prodErr)

    await this.upsertTranslations(client, id, input.translations)
    await this.syncApplicationLinks(client, id, input.applicationSlugs)
  }

  async deleteProduct(slug: string): Promise<void> {
    const client = this.getClient()
    const id = await this.resolveProductId(client, slug)
    const { error } = await client.from('products').delete().eq('id', id)
    if (error) throw new ProductRepositoryError(`product delete failed: ${error.message}`, error)
  }

  // ── internal helpers ──────────────────────────────────────────────────────────
  private async resolveProductId(client: SupabaseClient, slug: string): Promise<string> {
    const { data, error } = await client
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw new ProductRepositoryError(`product lookup failed: ${error.message}`, error)
    if (!data) throw new ProductNotFoundError(slug)
    return (data as { id: string }).id
  }

  private async upsertTranslations(
    client: SupabaseClient,
    productId: string,
    translations: Partial<Record<Locale, ProductTranslationInput>>,
  ): Promise<void> {
    const rows = (Object.entries(translations) as [Locale, ProductTranslationInput][])
      .filter(([, t]) => t && t.title.trim().length > 0)
      .map(([locale, t]) => ({
        product_id: productId,
        locale,
        ...translationColumns(t),
      }))
    if (rows.length === 0) return

    const { error } = await client
      .from('product_translations')
      .upsert(rows, { onConflict: 'product_id,locale' })
    if (error) throw new ProductRepositoryError(`translation upsert failed: ${error.message}`, error)
  }

  private async syncApplicationLinks(
    client: SupabaseClient,
    productId: string,
    applicationSlugs: string[],
  ): Promise<void> {
    const uniqueSlugs = Array.from(new Set(applicationSlugs.filter((s) => s.trim().length > 0)))
    let ids: string[] = []
    if (uniqueSlugs.length > 0) {
      const { data, error } = await client
        .from('applications')
        .select('id, slug')
        .in('slug', uniqueSlugs)
      if (error) throw new ProductRepositoryError(`applications lookup failed: ${error.message}`, error)
      const bySlug = new Map((data ?? []).map((a: { id: string; slug: string }) => [a.slug, a.id]))
      ids = uniqueSlugs.map((s) => bySlug.get(s)).filter((x): x is string => typeof x === 'string')
    }

    // Replace the full link set: delete existing then insert the resolved set.
    const { error: delErr } = await client.from('product_applications').delete().eq('product_id', productId)
    if (delErr) throw new ProductRepositoryError(`application link delete failed: ${delErr.message}`, delErr)

    if (ids.length > 0) {
      const { error: insErr } = await client
        .from('product_applications')
        .insert(ids.map((applicationId) => ({ product_id: productId, application_id: applicationId })))
      if (insErr) throw new ProductRepositoryError(`application link insert failed: ${insErr.message}`, insErr)
    }
  }
}

// ── Pure mapping ────────────────────────────────────────────────────────────────
export function mapAdminProductRow(row: AdminProductListRow): AdminProductRow {
  const locales = {} as Record<Locale, { title: string; approved: boolean } | null>
  for (const locale of ADMIN_LOCALES) {
    const tr = row.product_translations.find((t) => t.locale === locale)
    locales[locale] = tr ? { title: tr.title, approved: tr.approved } : null
  }

  const name =
    locales.en?.title ||
    row.product_translations.find((t) => t.approved)?.title ||
    row.product_translations[0]?.title ||
    row.slug

  const applicationSlugs = (row.product_applications ?? [])
    .map((a) => a.applications?.slug)
    .filter((s): s is string => typeof s === 'string')

  return {
    id: row.id,
    slug: row.slug,
    name,
    status: row.status,
    tone: row.tone,
    displayOrder: row.display_order,
    updatedAt: row.updated_at,
    locales,
    applicationSlugs,
  }
}

/** Default import for non-test callers. */
export function getAdminCatalogRepository(): SupabaseAdminCatalogRepository {
  return new SupabaseAdminCatalogRepository()
}
