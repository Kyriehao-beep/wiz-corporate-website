import { isLocale } from '@/i18n/locales'
import type { WizLocale } from '@/features/auth/require-admin'

/**
 * Resolve the `locale` hidden input into a safe value. Server actions must never
 * trust a raw client string, so anything that is not a known locale falls back
 * to 'en' before being passed to requireAdmin / revalidatePath.
 */
export function readLocale(formData: FormData): WizLocale {
  const raw = String(formData.get('locale') ?? 'en')
  return isLocale(raw) ? raw : 'en'
}
