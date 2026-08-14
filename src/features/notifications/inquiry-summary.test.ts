import { describe, it, expect } from 'vitest'

import { applicationDisplayName, buildSpecSummary, productDisplayName } from './inquiry-summary'
import type { RfqInput } from '@/features/rfq/schema'

describe('display names', () => {
  it('maps known product slugs', () => {
    expect(productDisplayName('embroidered-patches')).toBe('Embroidered Patches')
  })
  it('falls back to title-case for unknown slugs', () => {
    expect(productDisplayName('mystery-item')).toBe('Mystery Item')
  })
  it('maps known application slugs', () => {
    expect(applicationDisplayName('automotive')).toBe('Automotive')
  })
})

describe('buildSpecSummary', () => {
  const base: RfqInput = {
    locale: 'en',
    productSlug: 'custom-pvc-rubber-patches',
    applicationSlug: 'apparel',
    estimatedQuantity: 500,
    size: { kind: 'undecided' },
    dimension: '2d',
    backing: 'sew-on',
    companyName: 'ACME',
    contactName: 'Jane',
    workEmail: 'jane@acme.com',
    countryRegion: 'US',
    projectDescription: 'x'.repeat(20),
    privacyAccepted: true,
  }

  it('summarizes undecided size + 2D + backing', () => {
    expect(buildSpecSummary(base)).toBe('Qty 500 · 2D · Sew-on')
  })

  it('includes dimensions when known', () => {
    const r = { ...base, size: { kind: 'known' as const, widthMm: 100, heightMm: 80 } }
    expect(buildSpecSummary(r)).toBe('Qty 500 · 2D · 100×80 mm · Sew-on')
  })

  it('renders TBD variants', () => {
    const r = { ...base, dimension: 'need-advice' as const, backing: 'need-advice' as const }
    expect(buildSpecSummary(r)).toBe('Qty 500 · Dimensions TBD · Backing TBD')
  })
})
