import { describe, expect, it } from 'vitest'
import { quoteSchema, followUpSchema } from './quote-schema'

const FUTURE = '2030-01-01T00:00:00Z'
const PAST = '2020-01-01T00:00:00Z'

describe('quoteSchema', () => {
  it('accepts a well-formed amount-based quote', () => {
    const result = quoteSchema.safeParse({
      inquiryId: '00000000-0000-0000-0000-000000000000',
      amount: 1500.5,
      currency: 'USD',
      quoteDate: FUTURE,
    })
    expect(result.success).toBe(true)
  })

  it('accepts a zero amount when a PDF is attached', () => {
    const result = quoteSchema.safeParse({
      inquiryId: '00000000-0000-0000-0000-000000000000',
      amount: 0,
      currency: 'EUR',
      quoteDate: FUTURE,
      pdfStorageKey: 'quotes/abc.pdf',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-ISO currency', () => {
    expect(
      quoteSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        amount: 10,
        currency: 'dollars',
        quoteDate: FUTURE,
      }).success,
    ).toBe(false)
  })

  it('rejects negative amounts', () => {
    expect(
      quoteSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        amount: -5,
        currency: 'USD',
        quoteDate: FUTURE,
      }).success,
    ).toBe(false)
  })

  it('rejects an amount-less quote with no PDF', () => {
    expect(
      quoteSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        amount: 0,
        currency: 'USD',
        quoteDate: FUTURE,
      }).success,
    ).toBe(false)
  })
})

describe('followUpSchema', () => {
  it('accepts a future timestamp', () => {
    expect(
      followUpSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        followUpAt: FUTURE,
      }).success,
    ).toBe(true)
  })

  it('accepts the clear action', () => {
    expect(
      followUpSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        followUpAt: 'clear',
      }).success,
    ).toBe(true)
  })

  it('rejects a past timestamp', () => {
    expect(
      followUpSchema.safeParse({
        inquiryId: '00000000-0000-0000-0000-000000000000',
        followUpAt: PAST,
      }).success,
    ).toBe(false)
  })
})
