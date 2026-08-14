'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/features/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { validateTransition, type InquiryStatus } from './lifecycle'
import { readLocale } from './admin-shared'
import { quoteSchema } from './quote-schema'
import { toIsoDateTime } from './date-normalize'

/**
 * Record a quote against an inquiry and advance it to `quoted`. The status move
 * is guard-railed by `validateTransition`, so illegal transitions (e.g. closed →
 * quoted) are rejected before any write. Every insert is audit-logged.
 */
export async function recordQuoteAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const amountRaw = String(formData.get('amount') ?? '').trim()
  const currency = String(formData.get('currency') ?? '').trim().toUpperCase()
  const quoteDate = String(formData.get('quoteDate') ?? '').trim()
  const pdfStorageKey = String(formData.get('pdfStorageKey') ?? '').trim() || undefined

  const parsed = quoteSchema.safeParse({
    inquiryId: id,
    amount: amountRaw === '' ? 0 : Number(amountRaw),
    currency,
    quoteDate: toIsoDateTime(quoteDate),
    pdfStorageKey,
  })
  if (!parsed.success) {
    console.warn('[admin] quote rejected:', parsed.error.flatten().fieldErrors)
    return
  }

  await requireAdmin(locale)

  const client = createServiceClient()

  const { error: insertError } = await client.from('inquiry_quotes').insert({
    inquiry_id: id,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    quote_date: parsed.data.quoteDate.slice(0, 10),
    pdf_storage_key: parsed.data.pdfStorageKey ?? null,
  })
  if (insertError) {
    console.error('[admin] quote insert failed', insertError.message)
    return
  }

  // Advance to `quoted` only when the current status allows it.
  const { data: inquiry } = await client
    .from('inquiries')
    .select('status')
    .eq('id', id)
    .single()
  const from = (inquiry?.status ?? 'new') as InquiryStatus
  const transition = validateTransition({ from, to: 'quoted' })
  if (transition.success) {
    const { error: statusError } = await client
      .from('inquiries')
      .update({ status: 'quoted', updated_at: new Date().toISOString() }, { count: 'exact' })
      .eq('id', id)
      .eq('status', from)
    if (statusError) {
      console.error('[admin] quote status advance failed', statusError.message)
    } else {
      await client.from('inquiry_activities').insert({
        inquiry_id: id,
        activity_type: 'status_change',
        payload: { from, to: 'quoted', reason: 'Quote issued' },
      })
    }
  }

  await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'quote_added',
    payload: { amount: parsed.data.amount, currency: parsed.data.currency },
  })

  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}
