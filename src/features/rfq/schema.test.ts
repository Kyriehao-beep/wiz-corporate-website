import { describe, expect, it } from 'vitest'
import { rfqSchema, type RfqInput } from './schema'

function validInput(overrides: Partial<RfqInput> = {}): RfqInput {
  return {
    locale: 'en',
    productSlug: 'custom-pvc-rubber-patches',
    applicationSlug: 'surf-watersports',
    estimatedQuantity: 5000,
    size: { kind: 'known', widthMm: 50, heightMm: 30 },
    dimension: '2d',
    backing: 'sew-on',
    companyName: 'Acme Outdoor Co.',
    contactName: 'Jane Buyer',
    workEmail: 'jane@acme.com',
    countryRegion: 'United States',
    projectDescription: 'We need custom rubber patches for a surf apparel line.',
    privacyAccepted: true,
    ...overrides,
  }
}

describe('rfqSchema', () => {
  it('accepts a fully valid input with known dimensions', () => {
    const result = rfqSchema.safeParse(validInput())
    expect(result.success).toBe(true)
  })

  it('accepts undecided size and advice options', () => {
    const result = rfqSchema.safeParse(
      validInput({ size: { kind: 'undecided' }, dimension: 'need-advice', backing: 'need-advice' }),
    )
    expect(result.success).toBe(true)
  })

  it('rejects a zero quantity and a malformed email', () => {
    const result = rfqSchema.safeParse(validInput({ estimatedQuantity: 0, workEmail: 'invalid' }))
    expect(result.success).toBe(false)
  })

  it('requires the privacy checkbox to be explicitly accepted', () => {
    const result = rfqSchema.safeParse(validInput({ privacyAccepted: false as unknown as true }))
    expect(result.success).toBe(false)
  })

  it('rejects a project description that is too short', () => {
    const result = rfqSchema.safeParse(validInput({ projectDescription: 'too short' }))
    expect(result.success).toBe(false)
  })
})
