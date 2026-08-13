import { randomUUID } from 'node:crypto'

import { rfqSchema, type RfqInput } from '@/features/rfq/schema'
import { hashIdentifier } from '@/lib/security/rate-limit'
import { createServiceClient } from '@/lib/supabase/service'

import { buildInquiryPayload, generateInquiryNumber } from './rfq-mapping'
import { checkAndIncrementRateLimit } from './rate-limit-enforcement'

export type SubmitInquiryError = 'invalid_input' | 'rate_limited' | 'persistence_failed'

export type SubmitInquiryResult =
  | { ok: true; inquiryId: string; inquiryNumber: string }
  | { ok: false; error: SubmitInquiryError }

export interface SubmitContext {
  /** Client IP for rate-limit keying (already-hashed, never stored in cleartext). */
  ip?: string
  /** Secret used to derive the rate-limit key from email+ip. */
  rateLimitSecret: string
  /** Injectable clock for deterministic tests. */
  now?: Date
  /** Reuse a client-supplied idempotency key to make retries safe. */
  idempotencyKey?: string
  rateLimit?: { limit?: number; windowSec?: number; bucket?: string }
}

const RFQ_BUCKET = 'rfq_submit'
const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_SEC = 3600

/**
 * Server-only: validate a RFQ, enforce rate limits, and persist it as a new
 * inquiry with its line item and a `created` activity. Uses the service-role
 * client (bypasses RLS) because anonymous visitors submit RFQs.
 */
export async function submitInquiry(
  input: unknown,
  ctx: SubmitContext,
): Promise<SubmitInquiryResult> {
  const parsed = rfqSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input' }
  }
  const rfq: RfqInput = parsed.data

  const now = ctx.now ?? new Date()
  const keyHash = hashIdentifier(
    ctx.rateLimitSecret,
    `${rfq.workEmail}|${ctx.ip ?? 'unknown'}`,
  )

  const client = createServiceClient()

  const allowed = await checkAndIncrementRateLimit(
    client,
    keyHash,
    ctx.rateLimit?.bucket ?? RFQ_BUCKET,
    now,
    ctx.rateLimit?.limit ?? DEFAULT_LIMIT,
    ctx.rateLimit?.windowSec ?? DEFAULT_WINDOW_SEC,
  )
  if (!allowed) {
    return { ok: false, error: 'rate_limited' }
  }

  const idempotencyKey = ctx.idempotencyKey ?? randomUUID()
  const inquiryNumber = generateInquiryNumber(now)
  const { inquiry, items } = buildInquiryPayload(rfq, { idempotencyKey, inquiryNumber, now })

  const { data: inserted, error: insErr } = await client
    .from('inquiries')
    .insert(inquiry)
    .select('id')
    .single()
  if (insErr || !inserted) {
    return { ok: false, error: 'persistence_failed' }
  }

  const { error: itemsErr } = await client
    .from('inquiry_items')
    .insert(items.map((it) => ({ ...it, inquiry_id: inserted.id })))
  if (itemsErr) {
    return { ok: false, error: 'persistence_failed' }
  }

  await client.from('inquiry_activities').insert({
    inquiry_id: inserted.id,
    activity_type: 'created',
    payload: { source: inquiry.source, locale: inquiry.locale },
  })

  return { ok: true, inquiryId: inserted.id, inquiryNumber }
}
