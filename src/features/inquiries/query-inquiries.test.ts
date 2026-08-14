import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  applyInquiryFilters,
  buildInquiryFilterClauses,
  getInquiryDetail,
  mapInquiryDetail,
  mapInquirySummary,
  queryInquiries,
  type FilterClause,
  type InquiryFilters,
} from './query-inquiries'

describe('buildInquiryFilterClauses', () => {
  it('returns no clauses for an empty filter set', () => {
    expect(buildInquiryFilterClauses({})).toEqual([])
  })

  it('maps each populated filter to the correct column and operator', () => {
    const filters: InquiryFilters = {
      inquiryNumber: 'RFQ-20260813-A1B2C3',
      company: 'Outdoor',
      contact: 'Jane',
      email: 'jane@outdoor.co',
      projectText: 'surf',
      status: 'new',
      ownerId: 'user-1',
      source: 'rfq_wizard',
      country: 'Australia',
      locale: 'en',
      dateFrom: '2026-08-01T00:00:00Z',
      dateTo: '2026-08-31T23:59:59Z',
    }
    const clauses = buildInquiryFilterClauses(filters)
    expect(clauses).toEqual([
      { column: 'inquiry_number', op: 'eq', value: 'RFQ-20260813-A1B2C3' },
      { column: 'company_name', op: 'ilike', value: '%Outdoor%' },
      { column: 'contact_name', op: 'ilike', value: '%Jane%' },
      { column: 'work_email', op: 'eq', value: 'jane@outdoor.co' },
      { column: 'project_description', op: 'ilike', value: '%surf%' },
      { column: 'status', op: 'eq', value: 'new' },
      { column: 'owner_id', op: 'eq', value: 'user-1' },
      { column: 'source', op: 'eq', value: 'rfq_wizard' },
      { column: 'country_region', op: 'ilike', value: '%Australia%' },
      { column: 'locale', op: 'eq', value: 'en' },
      { column: 'created_at', op: 'gte', value: '2026-08-01T00:00:00Z' },
      { column: 'created_at', op: 'lte', value: '2026-08-31T23:59:59Z' },
    ] satisfies FilterClause[])
  })

  it('emits an in-clause for an array status filter', () => {
    const clauses = buildInquiryFilterClauses({ status: ['new', 'contacted'] })
    expect(clauses).toEqual([
      { column: 'status', op: 'in', value: 'new,contacted' },
    ])
  })

  it('ignores product/application slugs (they are resolved via inquiry_items)', () => {
    const clauses = buildInquiryFilterClauses({
      productSlug: 'custom-pvc-rubber-patches',
      applicationSlug: 'surf-watersports',
    })
    expect(clauses).toEqual([])
  })
})

describe('applyInquiryFilters', () => {
  it('applies every clause to the query builder in order', () => {
    const builder = {
      calls: [] as string[],
      eq: (c: string, v: unknown) => { builder.calls.push(`eq:${c}:${v}`); return builder },
      ilike: (c: string, v: string) => { builder.calls.push(`ilike:${c}:${v}`); return builder },
      gte: (c: string, v: unknown) => { builder.calls.push(`gte:${c}:${v}`); return builder },
      lte: (c: string, v: unknown) => { builder.calls.push(`lte:${c}:${v}`); return builder },
      in: (c: string, v: readonly string[]) => { builder.calls.push(`in:${c}:${v.join('|')}`); return builder },
    }
    const clauses: FilterClause[] = [
      { column: 'status', op: 'eq', value: 'new' },
      { column: 'company_name', op: 'ilike', value: '%Outdoor%' },
      { column: 'status', op: 'in', value: 'new,contacted' },
    ]
    applyInquiryFilters(builder, clauses)
    expect(builder.calls).toEqual([
      'eq:status:new',
      'ilike:company_name:%Outdoor%',
      'in:status:new|contacted',
    ])
  })
})

describe('mapInquirySummary', () => {
  it('snake_cases the row into the public summary shape', () => {
    const summary = mapInquirySummary({
      id: 'i-1',
      inquiry_number: 'RFQ-20260813-A1B2C3',
      company_name: 'Outdoor Co',
      contact_name: 'Jane',
      work_email: 'jane@outdoor.co',
      country_region: 'Australia',
      status: 'new',
      locale: 'en',
      source: 'rfq_wizard',
      owner_id: 'user-1',
      created_at: '2026-08-13T01:00:00Z',
      next_follow_up_at: null,
    })
    expect(summary).toEqual({
      id: 'i-1',
      inquiryNumber: 'RFQ-20260813-A1B2C3',
      companyName: 'Outdoor Co',
      contactName: 'Jane',
      workEmail: 'jane@outdoor.co',
      countryRegion: 'Australia',
      status: 'new',
      locale: 'en',
      source: 'rfq_wizard',
      ownerId: 'user-1',
      createdAt: '2026-08-13T01:00:00Z',
      nextFollowUpAt: null,
    })
  })
})

// Minimal thenable fake of a Supabase query result.
class FakeQuery {
  private result: { data: unknown; error: unknown }
  constructor(result: { data: unknown; error: unknown }) { this.result = result }
  then<T>(onfulfilled: (r: { data: unknown; error: unknown }) => T): Promise<T> {
    return Promise.resolve(onfulfilled(this.result))
  }
}

function fakeClient(rows: unknown[]): SupabaseClient {
  const builder = {
    eq: () => builder,
    ilike: () => builder,
    gte: () => builder,
    lte: () => builder,
    in: () => builder,
    order: () => builder,
    range: () => builder,
    select: () => builder,
  }
  const client = {
    from: vi.fn(() => builder),
  }
  // When awaited, the builder resolves to the canned rows.
  ;(builder as unknown as { then: unknown }).then = (resolve: (r: unknown) => unknown) =>
    Promise.resolve(resolve({ data: rows, error: null }))
  return client as unknown as SupabaseClient
}

describe('queryInquiries', () => {
  it('applies filters, orders by created_at desc, and maps rows', async () => {
    const client = fakeClient([
      {
        id: 'i-1',
        inquiry_number: 'RFQ-20260813-A1B2C3',
        company_name: 'Outdoor Co',
        contact_name: 'Jane',
        work_email: 'jane@outdoor.co',
        country_region: 'Australia',
        status: 'new',
        locale: 'en',
        source: 'rfq_wizard',
        owner_id: 'user-1',
        created_at: '2026-08-13T01:00:00Z',
        next_follow_up_at: null,
      },
    ])
    const result = await queryInquiries({ company: 'Outdoor', status: 'new' }, client)
    expect(result).toHaveLength(1)
    expect(result[0].companyName).toBe('Outdoor Co')
    expect(result[0].inquiryNumber).toBe('RFQ-20260813-A1B2C3')
  })
})

describe('mapInquiryDetail', () => {
  it('assembles the inquiry, items, and activities', () => {
    const detail = mapInquiryDetail(
      {
        id: 'i-1',
        inquiry_number: 'RFQ-1',
        company_name: 'Outdoor Co',
        contact_name: 'Jane',
        work_email: 'jane@outdoor.co',
        country_region: 'Australia',
        status: 'new',
        locale: 'en',
        source: 'rfq_wizard',
        owner_id: null,
        created_at: '2026-08-13T01:00:00Z',
        next_follow_up_at: null,
        project_description: 'Surf patches',
      },
      [{ product_slug: 'custom-pvc-rubber-patches', application_slug: 'surf-watersports', estimated_quantity: 500, spec: { dimension: '2d' } }],
      [{ activity_type: 'created', created_at: '2026-08-13T01:00:00Z', payload: { source: 'rfq_wizard' } }],
    )
    expect(detail.projectDescription).toBe('Surf patches')
    expect(detail.items[0].productSlug).toBe('custom-pvc-rubber-patches')
    expect(detail.activities[0].activityType).toBe('created')
  })
})

describe('getInquiryDetail', () => {
  it('returns null when the inquiry does not exist', async () => {
    // Awaiting the builder yields a single() result with null data.
    const nullBuilder = {
      eq: () => nullBuilder,
      single: () => new FakeQuery({ data: null, error: null }),
      select: () => nullBuilder,
    }
    const client = { from: vi.fn(() => nullBuilder) } as unknown as SupabaseClient
    expect(await getInquiryDetail('missing', client)).toBeNull()
  })
})
