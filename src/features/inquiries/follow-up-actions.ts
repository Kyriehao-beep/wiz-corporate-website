'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/features/auth/require-admin'
import { createServiceClient } from '@/lib/supabase/service'
import { readLocale } from './admin-shared'
import { followUpSchema } from './quote-schema'
import { toIsoDateTime } from './date-normalize'

/**
 * Schedule (or clear) the next follow-up for an inquiry. `followUpAt` is either
 * a future ISO timestamp or the literal 'clear'. Every change is audit-logged.
 */
export async function setFollowUpAction(formData: FormData): Promise<void> {
  const locale = readLocale(formData)
  const id = String(formData.get('id') ?? '')
  const rawFollowUp = String(formData.get('followUpAt') ?? '').trim()
  const followUpAt = rawFollowUp === '' ? 'clear' : toIsoDateTime(rawFollowUp)

  const parsed = followUpSchema.safeParse({ inquiryId: id, followUpAt })
  if (!parsed.success) {
    console.warn('[admin] follow-up rejected:', parsed.error.flatten().fieldErrors)
    return
  }

  await requireAdmin(locale)

  const next = parsed.data.followUpAt === 'clear' ? null : parsed.data.followUpAt
  const client = createServiceClient()
  const { error } = await client
    .from('inquiries')
    .update({ next_follow_up_at: next, updated_at: new Date().toISOString() }, { count: 'exact' })
    .eq('id', id)
  if (error) {
    console.error('[admin] follow-up update failed', error.message)
    return
  }
  await client.from('inquiry_activities').insert({
    inquiry_id: id,
    activity_type: 'follow_up',
    payload: { next_follow_up_at: next },
  })
  revalidatePath(`/${locale}/admin/inquiries/${id}`)
}
