import type { RfqInput } from '@/features/rfq/schema'

/**
 * Pure mapping from a validated RFQ submission to the Supabase insert payloads.
 * No DB, no clock, no randomness beyond the injectable options — fully unit-testable.
 */

export interface InquiryInsert {
  inquiry_number: string
  idempotency_key: string
  status: 'new'
  locale: RfqInput['locale']
  company_name: string
  contact_name: string
  work_email: string
  country_region: string
  project_description: string
  source: string
  submission_snapshot: RfqInput
  owner_id?: string | null
  next_follow_up_at?: string | null
}

export interface InquiryItemInsert {
  product_slug: string
  application_slug: string
  estimated_quantity: number
  spec: Record<string, unknown>
  sort_order: number
}

export interface RfqInquiryPayload {
  inquiry: InquiryInsert
  items: InquiryItemInsert[]
}

export interface MapOptions {
  idempotencyKey: string
  inquiryNumber: string
  now?: Date
  source?: string
  ownerId?: string | null
  nextFollowUpAt?: string | null
}

/** Build the inquiry + line-item insert payloads from a validated RFQ. */
export function buildInquiryPayload(rfq: RfqInput, opts: MapOptions): RfqInquiryPayload {
  const spec: Record<string, unknown> = {
    dimension: rfq.dimension,
    backing: rfq.backing,
    sizeKind: rfq.size.kind,
  }
  if (rfq.size.kind === 'known') {
    spec.widthMm = rfq.size.widthMm
    spec.heightMm = rfq.size.heightMm
  }

  const inquiry: InquiryInsert = {
    inquiry_number: opts.inquiryNumber,
    idempotency_key: opts.idempotencyKey,
    status: 'new',
    locale: rfq.locale,
    company_name: rfq.companyName,
    contact_name: rfq.contactName,
    work_email: rfq.workEmail,
    country_region: rfq.countryRegion,
    project_description: rfq.projectDescription,
    source: opts.source ?? 'rfq_wizard',
    submission_snapshot: rfq,
    owner_id: opts.ownerId ?? null,
    next_follow_up_at: opts.nextFollowUpAt ?? null,
  }

  const items: InquiryItemInsert[] = [
    {
      product_slug: rfq.productSlug,
      application_slug: rfq.applicationSlug,
      estimated_quantity: rfq.estimatedQuantity,
      spec,
      sort_order: 0,
    },
  ]

  return { inquiry, items }
}

/**
 * Human-readable inquiry number: `RFQ-YYYYMMDD-XXXX`.
 * Not a strict sequence — uniqueness comes from the `idempotency_key` column.
 */
export function generateInquiryNumber(now: Date = new Date()): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, '0')
  return `RFQ-${y}${m}${d}-${rand}`
}
