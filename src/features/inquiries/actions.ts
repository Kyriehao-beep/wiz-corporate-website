'use server'

import { headers } from 'next/headers'

import { submitInquiry } from './submit'

export interface RfqFormState {
  error?: 'invalid_input' | 'rate_limited' | 'try_again'
  inquiryNumber?: string
}

/**
 * Server action entry point for the RFQ wizard form.
 *
 * Expected FormData fields (the guided wizard posts these):
 *   locale, productSlug, applicationSlug, estimatedQuantity (number),
 *   sizeKind ('known'|'undecided'), widthMm, heightMm, dimension, backing,
 *   companyName, contactName, workEmail, countryRegion,
 *   projectDescription, privacyAccepted ('true')
 *
 * Validation is delegated to `rfqSchema` inside `submitInquiry`, so the action
 * only does type coercion + rate-limit context assembly.
 */
export async function submitRfqAction(
  _prevState: RfqFormState,
  formData: FormData,
): Promise<RfqFormState> {
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    raw[key] = typeof value === 'string' ? value : value
  }

  const num = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : v
  }

  const payload = {
    locale: raw.locale,
    productSlug: raw.productSlug,
    applicationSlug: raw.applicationSlug,
    estimatedQuantity: num(raw.estimatedQuantity),
    size:
      raw.sizeKind === 'known'
        ? { kind: 'known', widthMm: num(raw.widthMm), heightMm: num(raw.heightMm) }
        : { kind: 'undecided' },
    dimension: raw.dimension,
    backing: raw.backing,
    companyName: raw.companyName,
    contactName: raw.contactName,
    workEmail: raw.workEmail,
    countryRegion: raw.countryRegion,
    projectDescription: raw.projectDescription,
    privacyAccepted: raw.privacyAccepted === 'true' || raw.privacyAccepted === true,
  }

  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'
  const rateLimitSecret =
    process.env.RFQ_RATE_LIMIT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const result = await submitInquiry(payload, { ip, rateLimitSecret })
  if (!result.ok) {
    const map: Record<typeof result.error, RfqFormState['error']> = {
      invalid_input: 'invalid_input',
      rate_limited: 'rate_limited',
      persistence_failed: 'try_again',
    }
    return { error: map[result.error] }
  }
  return { inquiryNumber: result.inquiryNumber }
}
