import { randomUUID } from 'node:crypto'

import { rfqSchema, type RfqInput } from '@/features/rfq/schema'
import { hashIdentifier } from '@/lib/security/rate-limit'
import { createServiceClient } from '@/lib/supabase/service'

import {
  linkAttachments,
  uploadFilesToStorage,
  validateAttachmentSet,
  type UploadFile,
} from './attachments'
import { buildInquiryPayload, generateInquiryNumber } from './rfq-mapping'
import { checkAndIncrementRateLimit } from './rate-limit-enforcement'
import { notifyInquiryReceived } from '@/features/notifications/send-notification'
import {
  applicationDisplayName,
  buildSpecSummary,
  productDisplayName,
} from '@/features/notifications/inquiry-summary'

export type SubmitInquiryError =
  | 'invalid_input'
  | 'rate_limited'
  | 'invalid_attachment'
  | 'persistence_failed'

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
  /** Artwork files collected by the wizard (uploaded to private storage, linked to the new inquiry). */
  files?: UploadFile[]
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

  // Validate attachments up-front so malformed uploads are rejected as a client error
  // (invalid_attachment) before we consume the rate-limit budget or create any rows.
  if (ctx.files && ctx.files.length > 0) {
    const policy = validateAttachmentSet(
      ctx.files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    )
    if (!policy.ok) {
      console.warn('[submitInquiry] attachment policy rejected:', policy.reason)
      return { ok: false, error: 'invalid_attachment' }
    }
  }

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

  // Create the inquiry rows first. Artwork is only uploaded + linked AFTER this
  // succeeds, so a storage/upload failure can never leave a dangling inquiry row.
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

  // Upload + link artwork (non-fatal): an inquiry without attachments is still valid,
  // and an upload/link failure here cannot orphan rows since they already exist.
  if (ctx.files && ctx.files.length > 0) {
    try {
      const attachmentMetas = await uploadFilesToStorage(client, ctx.files)
      await linkAttachments(client, inserted.id, attachmentMetas)
    } catch (err) {
      console.error('[submitInquiry] attachment handling failed (non-fatal)', err)
    }
  }

  // Notifications are awaited but non-fatal: a mail-provider outage must never roll
  // back the inquiry. Errors are logged; the submission still succeeds.
  try {
    await notifyInquiryReceived({
      inquiryId: inserted.id,
      inquiryNumber,
      locale: rfq.locale,
      companyName: rfq.companyName,
      contactName: rfq.contactName,
      customerEmail: rfq.workEmail,
      countryRegion: rfq.countryRegion,
      productName: productDisplayName(rfq.productSlug),
      applicationName: applicationDisplayName(rfq.applicationSlug),
      specSummary: buildSpecSummary(rfq),
      source: inquiry.source,
      adminUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/inquiries/${inserted.id}`,
    })
  } catch (err) {
    console.error('[submitInquiry] notification dispatch failed (non-fatal)', err)
  }

  return { ok: true, inquiryId: inserted.id, inquiryNumber }
}
