import { createHmac } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { decodeWebhookSecret, safeEqualString, verifyResendWebhook } from './resend-webhook-verify'

// Mirror Resend's Svix signing so we can mint valid signatures in tests.
function sign(secret: string, id: string, ts: string, body: string): string {
  const key = decodeWebhookSecret(secret)
  const message = `${id}.${ts}.${body}`
  return createHmac('sha256', key).update(message).digest('base64')
}

const RAW_KEY = 'a-very-secret-signing-key-1234567890'
const SECRET = `whsec_${Buffer.from(RAW_KEY).toString('base64')}`

describe('decodeWebhookSecret', () => {
  it('strips whsec_ prefix and base64-decodes', () => {
    expect(decodeWebhookSecret(SECRET).toString('utf8')).toBe(RAW_KEY)
  })
  it('treats a bare string as already base64', () => {
    const bare = Buffer.from(RAW_KEY).toString('base64')
    expect(decodeWebhookSecret(bare).toString('utf8')).toBe(RAW_KEY)
  })
})

describe('safeEqualString', () => {
  it('matches equal strings', () => {
    expect(safeEqualString('abc', 'abc')).toBe(true)
  })
  it('rejects different lengths / values', () => {
    expect(safeEqualString('abc', 'abd')).toBe(false)
    expect(safeEqualString('abc', 'abcd')).toBe(false)
  })
})

describe('verifyResendWebhook', () => {
  const id = 'msg_p5jXN8AQM9LWM0D4loKWxJek'
  const OLD_TS = '1614265330'
  const body = '{"type":"email.delivered","data":{"id":"abc"}}'

  function nowTs(): string {
    return String(Math.floor(Date.now() / 1000))
  }

  it('accepts a correctly signed payload', () => {
    const ts = nowTs()
    const sig = sign(SECRET, id, ts, body)
    expect(
      verifyResendWebhook(body, SECRET, { id, timestamp: ts, signature: `v1,${sig}` }),
    ).toBe(true)
  })

  it('accepts legacy single-value signature too', () => {
    const ts = nowTs()
    const sig = sign(SECRET, id, ts, body)
    expect(verifyResendWebhook(body, SECRET, { id, timestamp: ts, signature: sig })).toBe(true)
  })

  it('rejects a tampered body', () => {
    const ts = nowTs()
    const sig = sign(SECRET, id, ts, body)
    expect(
      verifyResendWebhook(body + 'x', SECRET, { id, timestamp: ts, signature: `v1,${sig}` }),
    ).toBe(false)
  })

  it('rejects a wrong secret', () => {
    const ts = nowTs()
    const other = `whsec_${Buffer.from('different-key').toString('base64')}`
    const sig = sign(SECRET, id, ts, body)
    expect(
      verifyResendWebhook(body, other, { id, timestamp: ts, signature: `v1,${sig}` }),
    ).toBe(false)
  })

  it('rejects missing headers', () => {
    const ts = OLD_TS
    const sig = sign(SECRET, id, ts, body)
    expect(
      verifyResendWebhook(body, SECRET, { id: null, timestamp: ts, signature: `v1,${sig}` }),
    ).toBe(false)
  })

  it('rejects a stale timestamp (replay protection)', () => {
    const sig = sign(SECRET, id, OLD_TS, body)
    // OLD_TS is from 2021; now is far later → outside 5min window
    expect(
      verifyResendWebhook(body, SECRET, { id, timestamp: OLD_TS, signature: `v1,${sig}` }, Date.now(), 300),
    ).toBe(false)
  })

  it('accepts a recent timestamp within tolerance', () => {
    const nowSec = Math.floor(Date.now() / 1000)
    const sig = sign(SECRET, id, String(nowSec), body)
    expect(
      verifyResendWebhook(body, SECRET, { id, timestamp: String(nowSec), signature: `v1,${sig}` }),
    ).toBe(true)
  })
})
