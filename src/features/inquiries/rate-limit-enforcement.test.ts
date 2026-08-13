import { describe, expect, it } from 'vitest'

import { evaluateRateLimit, type RateLimitWindow } from './rate-limit-enforcement'

const t = (iso: string) => new Date(iso)

describe('evaluateRateLimit', () => {
  it('allows the first hit when there is no prior window', () => {
    const d = evaluateRateLimit(null, t('2026-08-13T00:00:00Z'), 10, 3600)
    expect(d.allowed).toBe(true)
    expect(d.hits).toBe(1)
  })

  it('counts up within the window and still allows under the limit', () => {
    const existing: RateLimitWindow = { hits: 3, windowStart: t('2026-08-13T00:00:00Z') }
    const d = evaluateRateLimit(existing, t('2026-08-13T00:10:00Z'), 10, 3600)
    expect(d.allowed).toBe(true)
    expect(d.hits).toBe(4)
    expect(d.windowStart).toBe(existing.windowStart)
  })

  it('rejects once the limit is reached', () => {
    const existing: RateLimitWindow = { hits: 10, windowStart: t('2026-08-13T00:00:00Z') }
    const d = evaluateRateLimit(existing, t('2026-08-13T00:10:00Z'), 10, 3600)
    expect(d.allowed).toBe(false)
    expect(d.hits).toBe(11)
  })

  it('resets the window after it has elapsed', () => {
    const existing: RateLimitWindow = { hits: 10, windowStart: t('2026-08-13T00:00:00Z') }
    const d = evaluateRateLimit(existing, t('2026-08-13T01:00:00Z'), 10, 3600)
    expect(d.allowed).toBe(true)
    expect(d.hits).toBe(1)
    expect(d.windowStart).toEqual(t('2026-08-13T01:00:00Z'))
  })

  it('does not mutate the input window', () => {
    const existing: RateLimitWindow = { hits: 5, windowStart: t('2026-08-13T00:00:00Z') }
    evaluateRateLimit(existing, t('2026-08-13T00:05:00Z'), 10, 3600)
    expect(existing.hits).toBe(5)
  })
})
