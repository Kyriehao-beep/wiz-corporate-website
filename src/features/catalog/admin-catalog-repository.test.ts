import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  emptyTranslation,
  mapAdminProductRow,
  SupabaseAdminCatalogRepository,
  type ProductWriteInput,
} from '@/features/catalog/admin-catalog-repository'

// Ensure crypto.randomUUID is available under jsdom.
import { webcrypto } from 'node:crypto'
if (!(globalThis as any).crypto?.randomUUID) {
  vi.stubGlobal('crypto', webcrypto)
}

interface Call {
  table: string
  op: 'select' | 'eq' | 'in' | 'order' | 'insert' | 'update' | 'upsert' | 'delete'
  payload?: unknown
}

interface Result {
  data: unknown
  error: { message: string } | null
}

class FakeBuilder {
  constructor(
    private client: FakeSupabaseClient,
    private table: string,
  ) {}

  select(_cols?: string) {
    this.client.record(this.table, 'select')
    return this
  }
  eq(_col: string, _val: unknown) {
    this.client.record(this.table, 'eq')
    return this
  }
  in(_col: string, _vals: unknown[]) {
    this.client.record(this.table, 'in')
    return this
  }
  order() {
    return this
  }
  insert(rows: unknown) {
    this.client.record(this.table, 'insert', rows)
    return this
  }
  update(obj: unknown) {
    this.client.record(this.table, 'update', obj)
    return this
  }
  upsert(rows: unknown, _opts?: unknown) {
    this.client.record(this.table, 'upsert', rows)
    return this
  }
  delete() {
    this.client.record(this.table, 'delete')
    return this
  }
  private resolve(): Result {
    const queue = this.client.queues[this.table] ?? []
    return queue.shift() ?? { data: null, error: null }
  }
  maybeSingle() {
    return Promise.resolve(this.resolve())
  }
  single() {
    return Promise.resolve(this.resolve())
  }
  then(onfulfilled?: (value: Result) => unknown): Promise<unknown> {
    return Promise.resolve(onfulfilled ? onfulfilled(this.resolve()) : this.resolve())
  }
}

class FakeSupabaseClient {
  calls: Call[] = []
  queues: Record<string, Result[]> = {}
  record(table: string, op: Call['op'], payload?: unknown) {
    this.calls.push({ table, op, payload })
  }
  setResponses(table: string, results: Result[]) {
    this.queues[table] = results
  }
  from(table: string) {
    return new FakeBuilder(this, table)
  }
}

function sampleInput(overrides: Partial<ProductWriteInput> = {}): ProductWriteInput {
  return {
    slug: 'new-patch',
    status: 'draft',
    tone: 'forest',
    displayOrder: 7,
    applicationSlugs: ['apparel', 'outdoor'],
    translations: {
      en: {
        title: 'New Patch',
        summary: 'A new patch',
        body: 'Body',
        seoTitle: 'New Patch | WIZ',
        seoDescription: 'desc',
        eyebrow: 'Eyebrow',
        suitability: ['Uniform'],
        construction: ['3D'],
        visualOptions: ['Matte'],
        attachmentOptions: ['Sew-on'],
        artworkGuidance: 'guide',
        approved: true,
        fallbackToEn: false,
      },
    },
    ...overrides,
  }
}

describe('mapAdminProductRow', () => {
  it('picks the English title and flattens locale flags + application slugs', () => {
    const row = {
      id: 'p1',
      slug: 'trail-patch',
      status: 'published',
      display_order: 2,
      tone: 'forest',
      updated_at: '2026-08-11T00:00:00Z',
      product_translations: [
        { locale: 'en', title: 'Trail Patch', approved: true },
        { locale: 'ja', title: 'トレイル', approved: false },
        { locale: 'zh-CN', title: '', approved: false },
      ],
      product_applications: [{ applications: { slug: 'apparel' } }, { applications: { slug: 'outdoor' } }],
    }
    const out = mapAdminProductRow(row as any)
    expect(out.name).toBe('Trail Patch')
    expect(out.locales.en).toEqual({ title: 'Trail Patch', approved: true })
    expect(out.locales['zh-CN']).toEqual({ title: '', approved: false })
    expect(out.applicationSlugs).toEqual(['apparel', 'outdoor'])
  })

  it('falls back to any approved translation then first when English is missing', () => {
    const row = {
      id: 'p2',
      slug: 'x',
      status: 'draft',
      display_order: 1,
      tone: 'forest',
      updated_at: '2026-08-10T00:00:00Z',
      product_translations: [{ locale: 'ja', title: 'Japanese', approved: true }],
    }
    expect(mapAdminProductRow(row as any).name).toBe('Japanese')

    const noApproved = {
      ...row,
      product_translations: [{ locale: 'ja', title: 'Japanese', approved: false }],
    }
    expect(mapAdminProductRow(noApproved as any).name).toBe('Japanese')
  })
})

describe('SupabaseAdminCatalogRepository', () => {
  let fake: FakeSupabaseClient
  let repo: SupabaseAdminCatalogRepository

  beforeEach(() => {
    fake = new FakeSupabaseClient()
    repo = new SupabaseAdminCatalogRepository(fake as any)
  })
  afterEach(() => {
    fake.calls = []
  })

  it('lists products with locale + application data', async () => {
    fake.setResponses('products', [
      {
        data: [
          {
            id: 'p1',
            slug: 'trail-patch',
            status: 'published',
            display_order: 2,
            tone: 'forest',
            updated_at: '2026-08-11T00:00:00Z',
            product_translations: [{ locale: 'en', title: 'Trail Patch', approved: true }],
            product_applications: [{ applications: { slug: 'apparel' } }],
          },
        ],
        error: null,
      },
    ])
    const rows = await repo.listProductsAdmin()
    expect(rows).toHaveLength(1)
    expect(rows[0].slug).toBe('trail-patch')
    expect(rows[0].locales.en?.approved).toBe(true)
    expect(rows[0].applicationSlugs).toEqual(['apparel'])
    expect(fake.calls[0]).toMatchObject({ table: 'products', op: 'select' })
  })

  it('creates a product, its translations, and application links', async () => {
    fake.setResponses('products', [{ data: null, error: null }])
    fake.setResponses('product_translations', [{ data: null, error: null }])
    fake.setResponses('applications', [
      {
        data: [
          { id: 'a1', slug: 'apparel' },
          { id: 'a2', slug: 'outdoor' },
        ],
        error: null,
      },
    ])
    fake.setResponses('product_applications', [{ data: null, error: null }, { data: null, error: null }])

    const id = await repo.createProduct(sampleInput(), 'editor-1')

    const productInsert = fake.calls.find((c) => c.table === 'products' && c.op === 'insert')
    expect(productInsert).toBeTruthy()
    expect((productInsert!.payload as any).slug).toBe('new-patch')
    expect((productInsert!.payload as any).created_by).toBe('editor-1')

    const trUpsert = fake.calls.find((c) => c.table === 'product_translations' && c.op === 'upsert')
    const trRows = (trUpsert!.payload as any[]) as any[]
    expect(trRows).toHaveLength(1)
    expect(trRows[0]).toMatchObject({ locale: 'en', title: 'New Patch', seo_title: 'New Patch | WIZ', approved: true })

    const appSelect = fake.calls.find((c) => c.table === 'applications' && c.op === 'in')
    expect(appSelect).toBeTruthy()

    const appInsert = fake.calls.find((c) => c.table === 'product_applications' && c.op === 'insert')
    const appRows = (appInsert!.payload as any[]) as any[]
    expect(appRows).toHaveLength(2)
    expect(appRows[0]).toMatchObject({ product_id: id, application_id: 'a1' })
    expect(appRows[1]).toMatchObject({ product_id: id, application_id: 'a2' })
  })

  it('updates a product and replaces application links', async () => {
    fake.setResponses('products', [{ data: { id: 'p1' }, error: null }, { data: null, error: null }])
    fake.setResponses('product_translations', [{ data: null, error: null }])
    fake.setResponses('applications', [
      { data: [{ id: 'a2', slug: 'outdoor' }], error: null },
    ])
    fake.setResponses('product_applications', [{ data: null, error: null }, { data: null, error: null }])

    await repo.updateProduct('old-slug', sampleInput({ applicationSlugs: ['outdoor'] }), 'editor-2')

    expect(fake.calls.some((c) => c.table === 'products' && c.op === 'select')).toBe(true)
    const updateCall = fake.calls.find((c) => c.table === 'products' && c.op === 'update')
    expect((updateCall!.payload as any).updated_by).toBe('editor-2')
    expect((updateCall!.payload as any).updated_at).toBeTruthy()

    const appDelete = fake.calls.find((c) => c.table === 'product_applications' && c.op === 'delete')
    const appInsert = fake.calls.find((c) => c.table === 'product_applications' && c.op === 'insert')
    expect(appDelete).toBeTruthy()
    expect((appInsert!.payload as any[])).toHaveLength(1)
    expect((appInsert!.payload as any[])[0]).toMatchObject({ application_id: 'a2' })
  })

  it('deletes a product after resolving its id', async () => {
    fake.setResponses('products', [{ data: { id: 'p9' }, error: null }, { data: null, error: null }])
    await repo.deleteProduct('gone')
    expect(fake.calls.find((c) => c.table === 'products' && c.op === 'delete')).toBeTruthy()
  })

  it('throws ProductNotFoundError when deleting a missing slug', async () => {
    fake.setResponses('products', [{ data: null, error: null }])
    await expect(repo.deleteProduct('nope')).rejects.toThrow(/not found/i)
  })

  it('emptyTranslation returns a controlled default', () => {
    expect(emptyTranslation()).toEqual({
      title: '',
      summary: '',
      body: '',
      seoTitle: '',
      seoDescription: '',
      eyebrow: '',
      suitability: [],
      construction: [],
      visualOptions: [],
      attachmentOptions: [],
      artworkGuidance: '',
      approved: false,
      fallbackToEn: false,
    })
  })
})
