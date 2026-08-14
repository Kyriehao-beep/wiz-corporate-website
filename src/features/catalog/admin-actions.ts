'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin, type WizLocale } from '@/features/auth/require-admin'
import {
  ADMIN_LOCALES,
  SupabaseAdminCatalogRepository,
  type ProductTranslationInput,
  type ProductWriteInput,
} from '@/features/catalog/admin-catalog-repository'
import type { Locale } from '@/i18n/locales'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const translationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  eyebrow: z.string(),
  suitability: z.array(z.string()),
  construction: z.array(z.string()),
  visualOptions: z.array(z.string()),
  attachmentOptions: z.array(z.string()),
  artworkGuidance: z.string(),
  approved: z.boolean(),
  fallbackToEn: z.boolean(),
})

const writeSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(SLUG_RE, 'Slug must be lowercase letters/digits with hyphen separators (e.g. heat-transfer-patch).'),
    status: z.enum(['draft', 'published', 'archived']),
    tone: z.string().trim().min(1, 'Tone is required.'),
    displayOrder: z.coerce.number().int().nonnegative(),
    translations: z.record(z.enum(['en', 'ja', 'zh-CN']), translationSchema),
    applicationSlugs: z.array(z.string()),
  })
  .refine((v) => Object.keys(v.translations).includes('en'), {
    message: 'At least the English translation is required.',
    path: ['translations'],
  })

export interface ProductFormState {
  ok?: boolean
  error?: 'validation' | 'save_failed' | 'not_found'
  message?: string
  fieldErrors?: Record<string, string>
}

export type ProductSaveAction = (
  prev: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>

function parseTranslation(fd: FormData, locale: Locale): ProductTranslationInput {
  const get = (k: string) => (fd.get(`${locale}_${k}`) as string | null) ?? ''
  const list = (k: string) =>
    get(k)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  const bool = (k: string) => {
    const v = fd.get(`${locale}_${k}`)
    return v === 'on' || v === 'true'
  }
  return {
    title: get('title'),
    summary: get('summary'),
    body: get('body'),
    seoTitle: get('seoTitle'),
    seoDescription: get('seoDescription'),
    eyebrow: get('eyebrow'),
    suitability: list('suitability'),
    construction: list('construction'),
    visualOptions: list('visualOptions'),
    attachmentOptions: list('attachmentOptions'),
    artworkGuidance: get('artworkGuidance'),
    approved: bool('approved'),
    fallbackToEn: bool('fallbackToEn'),
  }
}

/**
 * Server action for the product create/edit form. Guarded by `requireAdmin`.
 * `mode` + `originalSlug` hidden fields distinguish create vs update.
 */
export async function saveProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const locale = (formData.get('locale') as WizLocale) ?? 'en'
  const mode = (formData.get('mode') as 'create' | 'edit') ?? 'create'
  const originalSlug = (formData.get('originalSlug') as string) ?? ''

  let profile
  try {
    profile = await requireAdmin(locale)
  } catch {
    // requireAdmin redirects on failure; reaching here means an unexpected throw.
    return { error: 'save_failed', message: 'Authentication required.' }
  }

  const slug = ((formData.get('slug') as string) ?? '').trim()
  const translations: Partial<Record<Locale, ProductTranslationInput>> = {}
  for (const l of ADMIN_LOCALES) {
    const t = parseTranslation(formData, l)
    if (t.title.trim().length > 0) translations[l] = t
  }
  const applicationSlugs = (formData.getAll('applicationSlugs') as string[])
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  const parsed = writeSchema.safeParse({
    slug,
    status: formData.get('status') ?? 'draft',
    tone: (formData.get('tone') as string) ?? 'forest',
    displayOrder: formData.get('displayOrder') ?? 0,
    translations,
    applicationSlugs,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return {
      error: 'validation',
      message: parsed.error.issues[0]?.message ?? 'Validation failed.',
      fieldErrors,
    }
  }

  const repo = new SupabaseAdminCatalogRepository()
  const input: ProductWriteInput = parsed.data

  try {
    if (mode === 'edit' && originalSlug) {
      await repo.updateProduct(originalSlug, input, profile.id)
    } else {
      await repo.createProduct(input, profile.id)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { error: 'save_failed', message: `Could not save product: ${msg}` }
  }

  revalidatePath(`/${locale}/admin/products`)
  return { ok: true }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as WizLocale) ?? 'en'
  try {
    await requireAdmin(locale)
  } catch {
    return
  }
  const slug = (formData.get('slug') as string) ?? ''
  if (!slug) return

  const repo = new SupabaseAdminCatalogRepository()
  try {
    await repo.deleteProduct(slug)
  } catch {
    return
  }
  revalidatePath(`/${locale}/admin/products`)
}
