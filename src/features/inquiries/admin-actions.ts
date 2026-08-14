'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin, type WizLocale } from '@/features/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { validateTransition, INQUIRY_STATUSES, type InquiryStatus } from './lifecycle'

/**
 * Transition an inquiry's status. Guard-railed by `validateTransition` (pure,
 * TDD) so illegal moves and closure-without-reason are rejected before any write.
 * Returns void — failures are logged; the page re-renders via revalidatePath.
 */
export async function updateInquiryStatusAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as WizLocale) ?? 'en'
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
  const { error } = await client
    .from('inquiries')
    .update({ status: to, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[admin] status update failed', error.message)
    return
  }
  await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'status_changed',
    payload: { from, to, reason },
  })
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
  revalidatePath(`/${locale}/admin/inquiries`)
}

/** Assign (or unassign with an empty value) the inquiry owner. */
export async function assignInquiryAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as WizLocale) ?? 'en'
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
    activity_type: 'assigned',
    payload: { owner_id: ownerId },
  })
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}

/** Append an internal note (never customer-visible). */
export async function addInquiryNoteAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as WizLocale) ?? 'en'
  const id = String(formData.get('id') ?? '')
  const note = String(formData.get('note') ?? '').trim()
  if (!id || !note) return

  await requireAdmin(locale)

  const client = createServiceClient()
  const { error } = await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'note',
    payload: { note },
  })
  if (error) {
    console.error('[admin] note insert failed', error.message)
    return
  }
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}
