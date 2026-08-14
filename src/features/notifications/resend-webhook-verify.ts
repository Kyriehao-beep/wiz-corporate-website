import { createHmac, timingSafeEqual } from 'node:crypto'

export interface ResendWebhookHeaders {
  id: string | null
  timestamp: string | null
  signature: string | null
}

/**
 * Resend signs webhooks using the **Svix** scheme (the official, current format):
 *   - Headers: `svix-id`, `svix-timestamp`, `svix-signature`
 *   - Secret: `whsec_<base64>` (strip prefix, base64-decode to get the raw key)
 *   - Signature: `v1,<base64(hmacSha256(key, "<id>.<timestamp>.<rawBody>"))>`
 *   - Possibly multiple comma-separated schemes; we take the last (`v1`) value
 *
 * The signed message is the concatenation `${id}.${timestamp}.${body}` joined by
 * dots — NOT the raw body alone. A naive HMAC over just the body will reject every
 * legitimate Resend webhook.
 */
export function decodeWebhookSecret(secret: string): Buffer {
  const b64 = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  return Buffer.from(b64, 'base64')
}

/** Constant-time comparison of two strings (signature-safe). */
export function safeEqualString(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/**
 * Verify a Resend (Svix) webhook signature.
 * Returns false on any malformed header, bad signature, or stale timestamp
 * (replay protection via a 5-minute tolerance window).
 */
export function verifyResendWebhook(
  rawBody: string,
  secret: string,
  headers: ResendWebhookHeaders,
  nowMs: number = Date.now(),
  toleranceSec = 300,
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  if (Math.abs(Math.floor(nowMs / 1000) - ts) > toleranceSec) return false

  // signature is "v1,<base64hmac>" — take the last comma-separated value
  const provided = signature.split(',').pop()
  if (!provided) return false

  const key = decodeWebhookSecret(secret)
  const message = `${id}.${timestamp}.${rawBody}`
  const expected = createHmac('sha256', key).update(message).digest('base64')

  return safeEqualString(provided, expected)
}
