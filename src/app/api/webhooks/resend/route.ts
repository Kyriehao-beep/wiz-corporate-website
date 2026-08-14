import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase/service'
import { verifyResendWebhook } from '@/features/notifications/resend-webhook-verify'

// Webhook verification + DB writes need the Node runtime (crypto, service client).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Resend event type → notification_queue.status (matches the status enum:
// pending | sent | failed | retry).
const QUEUE_STATUS_BY_EVENT: Record<string, 'sent' | 'failed'> = {
  'email.sent': 'sent',
  'email.delivered': 'sent',
  'email.bounced': 'failed',
  'email.complained': 'failed',
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  const raw = await req.text()

  if (!secret) {
    // Dev only: skip signature verification. In production a missing secret is a
    // misconfiguration — refuse to mutate delivery state on unsigned requests
    // (otherwise anyone could forge bounce/complaint events).
    if (process.env.NODE_ENV === 'production') {
      console.error('[resend webhook] RESEND_WEBHOOK_SECRET unset in production — refusing unsigned events')
      return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 })
    }
    console.warn('[resend webhook] RESEND_WEBHOOK_SECRET unset — skipping signature verification (dev)')
  } else if (
    !verifyResendWebhook(raw, secret, {
      id: req.headers.get('svix-id'),
      timestamp: req.headers.get('svix-timestamp'),
      signature: req.headers.get('svix-signature'),
    })
  ) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let event: { type?: string; data?: { id?: string } }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const type = event.type
  const messageId = event.data?.id
  if (!type || !messageId) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const queueStatus = QUEUE_STATUS_BY_EVENT[type]
  if (!queueStatus) {
    // Known-but-ignored event (e.g. email.opened): acknowledge without mutation.
    return NextResponse.json({ received: true, ignored: type })
  }

  try {
    const client = createServiceClient()
    const { data: notif } = await client
      .from('notification_queue')
      .select('id')
      .eq('provider_message_id', messageId)
      .maybeSingle()

    if (!notif) {
      return NextResponse.json({ received: true, unmatched: messageId })
    }

    await client
      .from('notification_queue')
      .update({ status: queueStatus, updated_at: new Date().toISOString() })
      .eq('id', notif.id)

    await client.from('notification_deliveries').insert({
      notification_id: notif.id,
      event: type,
      status: type.replace('email.', ''),
      payload: event.data ?? {},
    })
  } catch (err) {
    console.error('[resend webhook] failed to persist event', err)
    return NextResponse.json({ error: 'persistence_failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
