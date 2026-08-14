export interface SendEmailInput {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
  /** Override the default From address for this message. */
  from?: string
}

export interface ResendPayload {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  reply_to?: string
}

export interface SendEmailResult {
  ok: boolean
  /** Provider message id, used to correlate webhook delivery events. */
  id?: string
  error?: string
}

const RESEND_API_URL = 'https://api.resend.com/emails'

/** Pure builder — extracted so the exact payload shape is unit-testable. */
export function buildResendPayload(input: SendEmailInput, defaultFrom: string): ResendPayload {
  const from = input.from ?? defaultFrom
  const payload: ResendPayload = {
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  }
  if (input.html) payload.html = input.html
  if (input.replyTo) payload.reply_to = input.replyTo
  return payload
}

/**
 * Send a transactional email via Resend's REST API using `fetch` (no SDK
 * dependency). Fails soft when RESEND_API_KEY is unset so local/dev never throws
 * on a missing mail provider.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'not_configured' }
  }
  const from = process.env.RESEND_FROM ?? 'WIZ <notifications@wiz.com>'
  const payload = buildResendPayload(input, from)

  let res: Response
  try {
    res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    return { ok: false, error: `request_failed:${String(err)}` }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, error: `http_${res.status}:${body.slice(0, 200)}` }
  }

  const data = (await res.json().catch(() => null)) as { id?: string } | null
  return { ok: true, id: data?.id }
}
