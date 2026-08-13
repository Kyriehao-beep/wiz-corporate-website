import { describe, expect, it } from 'vitest'
import { hashIdentifier, normalizeIdentifier, rateLimitKey } from './rate-limit'

describe('rate-limit identifiers', () => {
  it('normalizes email case and surrounding whitespace', () => {
    expect(normalizeIdentifier('  Buyer@Acme.COM ')).toBe('buyer@acme.com')
  })

  it('produces a stable HMAC hash and never leaks the raw value', () => {
    const secret = 'test-secret'
    const a = hashIdentifier(secret, 'buyer@acme.com')
    const b = hashIdentifier(secret, 'buyer@acme.com')
    expect(a).toBe(b)
    expect(a).not.toContain('buyer@acme.com')
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('different secrets yield different hashes for the same value', () => {
    expect(hashIdentifier('secret-a', '1.2.3.4')).not.toBe(hashIdentifier('secret-b', '1.2.3.4'))
  })

  it('combines hashed ip and email into a composite key', () => {
    const key = rateLimitKey('secret', 'buyer@acme.com', '1.2.3.4')
    expect(key).toMatch(/^[0-9a-f]{64}:[0-9a-f]{64}$/)
  })
})
