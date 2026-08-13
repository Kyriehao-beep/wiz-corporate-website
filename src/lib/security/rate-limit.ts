import { createHmac } from 'node:crypto'

/**
 * Rate-limit key derivation. Raw client identifiers (IP, email) are never stored;
 * only their keyed HMAC-SHA256 digests are used as bucket keys.
 */

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase()
}

export function hashIdentifier(secret: string, value: string): string {
  return createHmac('sha256', secret).update(normalizeIdentifier(value)).digest('hex')
}

/** Composite bucket key binding email + IP without persisting either in cleartext. */
export function rateLimitKey(secret: string, email: string, ip: string): string {
  return `${hashIdentifier(secret, email)}:${hashIdentifier(secret, ip)}`
}
