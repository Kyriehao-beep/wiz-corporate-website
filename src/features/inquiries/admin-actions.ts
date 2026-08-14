'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/features/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { validateTransition, INQUIRY_STATUSES, type InquiryStatus } from './lifecycle'
import { readLocale } from './admin-shared'

/**
 * Transition an inquiry's status. Guard-railed by `validateTransition` (pure,
 * TDD) so illegal moves and closure/reopen-without-reason are rejected. The
 * `.eq('status', from)` clause pins the update to the *persisted* status, so a
 * forged `from` cannot skip the lifecycle. Returns void — failures are logged;
 * the page re-renders via revalidatePath.
 */
export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const from = formData.get('from') as InquiryStatus
  const to = formData.get('to') as InquiryStatus
  const reason = String(formData.get('reason') ?? '').trim()

  if (!id || !INQUIRY_STATUSES.includes(from) || !INQUIRY_STATUSES.includes(to)) {
    console.warn('[admin] status update: invalid input rejected')
    return
  }

  await requireAdmin(locale)

  const check = validateTransition({ from, to, reason })
  if (!check.success) {
    console.warn('[admin] status update rejected:', check.error)
    return
  }

  const client = createServiceClient()
  const { error, count } = await client
    .from('inquiries')
    .update({ status: to, updated_at: new Date().toISOString() }, { count: 'exact' })
    .eq('id', id)
    .eq('status', from)
  if (error) {
    console.error('[admin] status update failed', error.message)
    return
  }
  if ((count ?? 0) === 0) {
    console.warn('[admin] status update: persisted status did not match, no rows updated')
    return
  }
  await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'status_change',
    payload: { from, to, reason },
  })
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
  revalidatePath(`/${locale}/admin/inquiries`)
}

/** Assign (or unassign with an empty value) the inquiry owner. */
export async function assignInquiryAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const ownerId = String(formData.get('ownerId') ?? '').trim() || null
  if (!id) return

  await requireAdmin(locale)

  const client = createServiceClient()
  const { error } = await client
    .from('inquiries')
    .update({ owner_id: ownerId, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[admin] assign failed', error.message)
    return
  }
  await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'assignment',
    payload: { owner_id: ownerId },
  })
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}

/** Append an internal note (never customer-visible). */
export async function addInquiryNoteAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const note = String(formData.get('note') ?? '').trim()
  if (!id || !note) return

  await requireAdmin(locale)

  const client = createServiceClient()
  const { error } = await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'internal_note',
    payload: { note },
  })
  if (error) {
    console.error('[admin] note insert failed', error.message)
    return
  }
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}

/** Record an outbound/inbound email or phone contact attempt (audit only). */
export async function recordContactAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const channel = String(formData.get('channel') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()
  if (!id || !note) return
  if (channel !== 'email' && channel !== 'phone') {
    console.warn('[admin] contact: invalid channel rejected')
    return
  }

  await requireAdmin(locale)

  const client = createServiceClient()
  const activityType = channel === 'phone' ? 'phone_contact' : 'email_contact'
  const { error } = await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: activityType,
    payload: { channel, note },
  })
  if (error) {
    console.error('[admin] contact insert failed', error.message)
    return
  }
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}
