import { describe, it, expect } from 'vitest'

import { parseTurnstileResponse, verifyTurnstile } from './turnstile'

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return (async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })) as unknown as typeof fetch
}

describe('parseTurnstileResponse', () => {
  it('passes when success is true', () => {
    expect(parseTurnstileResponse({ success: true })).toBe(true)
  })
  it('fails when success is false', () => {
    expect(parseTurnstileResponse({ success: false })).toBe(false)
  })
  it('fails on a malformed body', () => {
    expect(parseTurnstileResponse({})).toBe(false)
  })
})

describe('verifyTurnstile', () => {
  it('fails OPEN when no secret is configured', async () => {
    const r = await verifyTurnstile({ token: null, secret: '' })
    expect(r.ok).toBe(true)
    expect(r.reason).toBe('turnstile_not_configured')
  })

  it('fails CLOSED when a token is missing but a secret exists', async () => {
    const r = await verifyTurnstile({ token: null, secret: 'sec' })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('missing_token')
  })

  it('passes when Cloudflare returns success', async () => {
    const r = await verifyTurnstile({
      token: 'tok',
      secret: 'sec',
      fetchImpl: fakeFetch({ success: true, 'error-codes': [] }),
    })
    expect(r.ok).toBe(true)
  })

  it('fails CLOSED on a rejected challenge', async () => {
    const r = await verifyTurnstile({
      token: 'tok',
      secret: 'sec',
      fetchImpl: fakeFetch({ success: false, 'error-codes': ['invalid-input-response'] }),
    })
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('challenge_failed')
  })

  it('fails CLOSED on a non-200 siteverify response', async () => {
    const r = await verifyTurnstile({ token: 'tok', secret: 'sec', fetchImpl: fakeFetch({}, 500) })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('siteverify_http_500')
  })

  it('fails OPEN when Cloudflare is unreachable (availability over strictness)', async () => {
    const broken = (async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    const r = await verifyTurnstile({ token: 'tok', secret: 'sec', fetchImpl: broken })
    expect(r.ok).toBe(true)
    expect(r.reason).toContain('siteverify_unreachable')
  })

  it('forwards the caller IP in the request', async () => {
    let receivedBody: URLSearchParams | undefined
    const spy = ((_url: string, init?: RequestInit) => {
      receivedBody = init?.body instanceof URLSearchParams ? init.body : undefined
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)
    }) as unknown as typeof fetch
    await verifyTurnstile({ token: 'tok', secret: 'sec', ip: '1.2.3.4', fetchImpl: spy })
    expect(receivedBody?.get('remoteip')).toBe('1.2.3.4')
  })
})
