import type { Locale } from '@/i18n/locales'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createServiceClient } from '@/lib/supabase/service'
import { buildCustomerConfirmation, buildInternalAlert } from './notify-content'
import { sendEmail } from './resend-client'

export interface NotifyInquiryInput {
  inquiryId: string
  inquiryNumber: string
  locale: Locale
  companyName: string
  contactName: string
  customerEmail: string
  countryRegion: string
  productName: string
  applicationName: string
  specSummary: string
  source: string
  /** Absolute admin URL for the new inquiry (staff-only link). */
  adminUrl: string
}

export type NotifyOutcome = 'sent' | 'failed' | 'skipped'

export interface NotifyResult {
  customer: NotifyOutcome
  internal: NotifyOutcome
}

/** Where internal (WIZ staff) alerts are delivered. */
function internalNotifyEmail(): string {
  return process.env.INQUIRY_NOTIFY_EMAIL ?? process.env.SALES_EMAIL ?? 'sales@wiz.com'
}

/**
 * Record a notification row so delivery state is auditable and webhook events can
 * be correlated back to the inquiry. Failures here are non-fatal.
 */
async function recordNotification(
  client: SupabaseClient,
  input: NotifyInquiryInput,
  recipientType: 'customer' | 'internal',
  locale: Locale,
  send: { ok: boolean; id?: string },
): Promise<void> {
  const { error } = await client.from('notification_queue').insert({
    inquiry_id: input.inquiryId,
    recipient_type: recipientType,
    locale,
    channel: 'email',
    // 'pending' until a webhook event (email.sent/delivered/bounced) flips it;
    // 'failed' only when the initial send itself was rejected by the provider.
    status: send.ok ? 'pending' : 'failed',
    provider_message_id: send.id ?? null,
  })
  if (error) {
    console.error(`[notify] failed to record ${recipientType} notification`, error.message)
  }
}

/**
 * Build + send both RFQ emails (customer confirmation + internal staff alert) and
 * persist their queue rows. Never throws — a mail provider outage must not break
 * the inquiry submission. Returns the per-recipient outcome for logging.
 */
export async function notifyInquiryReceived(input: NotifyInquiryInput): Promise<NotifyResult> {
  const result: NotifyResult = { customer: 'skipped', internal: 'skipped' }
  try {
    const customer = buildCustomerConfirmation({
      inquiryNumber: input.inquiryNumber,
      locale: input.locale,
      companyName: input.companyName,
      contactName: input.contactName,
      productName: input.productName,
      applicationName: input.applicationName,
      specSummary: input.specSummary,
      source: input.source,
    })
    const internal = buildInternalAlert({
      inquiryNumber: input.inquiryNumber,
      locale: 'zh-CN',
      companyName: input.companyName,
      contactName: input.contactName,
      countryRegion: input.countryRegion,
      productName: input.productName,
      applicationName: input.applicationName,
      source: input.source,
      adminUrl: input.adminUrl,
    })

    const customerSend = await sendEmail({
      to: input.customerEmail,
      subject: customer.subject,
      text: customer.bodyLines.join('\n'),
    })
    const internalSend = await sendEmail({
      to: internalNotifyEmail(),
      subject: internal.subject,
      text: internal.bodyLines.join('\n'),
    })

    result.customer = customerSend.ok ? 'sent' : 'failed'
    result.internal = internalSend.ok ? 'sent' : 'failed'

    const client = createServiceClient()
    await recordNotification(client, input, 'customer', input.locale, customerSend)
    await recordNotification(client, input, 'internal', 'zh-CN', internalSend)
  } catch (err) {
    console.error('[notifyInquiryReceived] dispatch failed', err)
  }
  return result
}
