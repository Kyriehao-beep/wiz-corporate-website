import { describe, expect, it } from 'vitest'

import { buildInquiryPayload, generateInquiryNumber, type MapOptions } from './rfq-mapping'
import type { RfqInput } from '@/features/rfq/schema'

function validRfq(overrides: Partial<RfqInput> = {}): RfqInput {
  return {
    locale: 'zh-CN',
    productSlug: 'heat-transfer-rubber-patches',
    applicationSlug: 'apparel',
    estimatedQuantity: 500,
    size: { kind: 'known', widthMm: 40, heightMm: 25 },
    dimension: '2d',
    backing: 'heat-transfer',
    companyName: 'Acme Co',
    contactName: 'Jane Doe',
    workEmail: 'jane@acme.com',
    countryRegion: 'United States',
    projectDescription: 'A detailed project description longer than twenty chars.',
    privacyAccepted: true,
    ...overrides,
  } as RfqInput
}

const opts: MapOptions = {
  idempotencyKey: '00000000-0000-0000-0000-000000000001',
  inquiryNumber: 'RFQ-20260813-AAAAAA',
}

describe('buildInquiryPayload', () => {
  it('maps scalar fields and stamps idempotency + number', () => {
    const { inquiry, items } = buildInquiryPayload(validRfq(), opts)
    expect(inquiry.inquiry_number).toBe('RFQ-20260813-AAAAAA')
    expect(inquiry.idempotency_key).toBe(opts.idempotencyKey)
    expect(inquiry.status).toBe('new')
    expect(inquiry.locale).toBe('zh-CN')
    expect(inquiry.company_name).toBe('Acme Co')
    expect(inquiry.contact_name).toBe('Jane Doe')
    expect(inquiry.work_email).toBe('jane@acme.com')
    expect(inquiry.country_region).toBe('United States')
    expect(inquiry.project_description).toMatch(/detailed project description/)
    expect(inquiry.source).toBe('rfq_wizard')
    expect(inquiry.submission_snapshot).toMatchObject({ productSlug: 'heat-transfer-rubber-patches' })
    expect(items).toHaveLength(1)
  })

  it('captures known dimensions into spec jsonb', () => {
    const { items } = buildInquiryPayload(validRfq(), opts)
    expect(items[0].spec).toEqual({
      dimension: '2d',
      backing: 'heat-transfer',
      sizeKind: 'known',
      widthMm: 40,
      heightMm: 25,
    })
    expect(items[0].estimated_quantity).toBe(500)
    expect(items[0].product_slug).toBe('heat-transfer-rubber-patches')
    expect(items[0].application_slug).toBe('apparel')
  })

  it('omits width/height for undecided size but keeps sizeKind', () => {
    const { items } = buildInquiryPayload(
      validRfq({ size: { kind: 'undecided' } }),
      opts,
    )
    expect(items[0].spec).toEqual({
      dimension: '2d',
      backing: 'heat-transfer',
      sizeKind: 'undecided',
    })
    expect(items[0].spec).not.toHaveProperty('widthMm')
  })

  it('honours injected source and owner', () => {
    const { inquiry } = buildInquiryPayload(validRfq(), {
      ...opts,
      source: 'embed_form',
      ownerId: '00000000-0000-0000-0000-000000000002',
    })
    expect(inquiry.source).toBe('embed_form')
    expect(inquiry.owner_id).toBe('00000000-0000-0000-0000-000000000002')
  })
})

describe('generateInquiryNumber', () => {
  it('produces an RFQ-YYYYMMDD-XXXX shaped number', () => {
    const num = generateInquiryNumber(new Date('2026-08-13T00:00:00Z'))
    expect(num).toMatch(/^RFQ-20260813-[0-9A-Z]{6}$/)
  })
})
