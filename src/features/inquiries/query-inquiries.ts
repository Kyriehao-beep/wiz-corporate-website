import type { PostgrestFilterBuilder, SupabaseClient } from '@supabase/supabase-js'
import type { Locale } from '@/i18n/locales'
import type { InquiryStatus } from './lifecycle'

/**
 * Inquiry read models and query builders for the admin console (Plan Task 9).
 *
 * The *pure* parts — `buildInquiryFilterClauses`, `applyInquiryFilters`,
 * `mapInquirySummary`, `mapInquiryDetail` — have zero infrastructure
 * dependencies and are fully unit-tested. The `queryInquiries` /
 * `getInquiryDetail` wrappers are thin Supabase adapters: they compile and the
 * predicate mapping is verified, but the live round-trip needs the database
 * brought up per the local Supabase runbook (item 3).
 */

export type { InquiryStatus }

export interface InquiryFilters {
  inquiryNumber?: string
  company?: string
  contact?: string
  email?: string
  projectText?: string
  status?: InquiryStatus | InquiryStatus[]
  ownerId?: string
  source?: string
  country?: string
  locale?: Locale
  /** Resolved through the `inquiry_items` relation, not the inquiries table. */
  productSlug?: string
  applicationSlug?: string
  /** ISO timestamps (inclusive bounds). */
  dateFrom?: string
  dateTo?: string
}

export interface FilterClause {
  column: string
  op: 'eq' | 'ilike' | 'gte' | 'lte' | 'in'
  value: string
}

const SUMMARY_COLUMNS =
  'id, inquiry_number, company_name, contact_name, work_email, country_region, status, locale, source, owner_id, created_at, next_follow_up_at'

export function buildInquiryFilterClauses(filters: InquiryFilters): FilterClause[] {
  const clauses: FilterClause[] = []
  if (filters.inquiryNumber) clauses.push({ column: 'inquiry_number', op: 'eq', value: filters.inquiryNumber })
  if (filters.company) clauses.push({ column: 'company_name', op: 'ilike', value: `%${filters.company}%` })
  if (filters.contact) clauses.push({ column: 'contact_name', op: 'ilike', value: `%${filters.contact}%` })
  if (filters.email) clauses.push({ column: 'work_email', op: 'eq', value: filters.email })
  if (filters.projectText) clauses.push({ column: 'project_description', op: 'ilike', value: `%${filters.projectText}%` })
  if (filters.status) {
    clauses.push(
      Array.isArray(filters.status)
        ? { column: 'status', op: 'in', value: filters.status.join(',') }
        : { column: 'status', op: 'eq', value: filters.status },
    )
  }
  if (filters.ownerId) clauses.push({ column: 'owner_id', op: 'eq', value: filters.ownerId })
  if (filters.source) clauses.push({ column: 'source', op: 'eq', value: filters.source })
  if (filters.country) clauses.push({ column: 'country_region', op: 'ilike', value: `%${filters.country}%` })
  if (filters.locale) clauses.push({ column: 'locale', op: 'eq', value: filters.locale })
  if (filters.dateFrom) clauses.push({ column: 'created_at', op: 'gte', value: filters.dateFrom })
  if (filters.dateTo) clauses.push({ column: 'created_at', op: 'lte', value: filters.dateTo })
  // productSlug / applicationSlug are intentionally excluded: they live on
  // inquiry_items and are resolved as a separate id lookup in queryInquiries.
  return clauses
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type ChainableQuery = {
  eq(column: string, value: unknown): ChainableQuery
  ilike(column: string, value: string): ChainableQuery
  gte(column: string, value: unknown): ChainableQuery
  lte(column: string, value: unknown): ChainableQuery
  in(column: string, values: readonly string[]): ChainableQuery
}

export function applyInquiryFilters(
  query: ChainableQuery,
  clauses: FilterClause[],
): ChainableQuery {
  let current = query
  for (const clause of clauses) {
    switch (clause.op) {
      case 'eq': current = current.eq(clause.column, clause.value); break
      case 'ilike': current = current.ilike(clause.column, clause.value); break
      case 'gte': current = current.gte(clause.column, clause.value); break
      case 'lte': current = current.lte(clause.column, clause.value); break
      case 'in': current = current.in(clause.column, clause.value.split(',')); break
    }
  }
  return current
}

export interface InquirySummary {
  id: string
  inquiryNumber: string
  companyName: string
  contactName: string
  workEmail: string
  countryRegion: string
  status: InquiryStatus
  locale: Locale
  source: string
  ownerId: string | null
  createdAt: string
  nextFollowUpAt: string | null
}

interface InquiryRow {
  id: string
  inquiry_number: string
  company_name: string
  contact_name: string
  work_email: string
  country_region: string
  status: InquiryStatus
  locale: Locale
  source: string
  owner_id: string | null
  created_at: string
  next_follow_up_at: string | null
  project_description?: string
}

export function mapInquirySummary(row: InquiryRow): InquirySummary {
  return {
    id: row.id,
    inquiryNumber: row.inquiry_number,
    companyName: row.company_name,
    contactName: row.contact_name,
    workEmail: row.work_email,
    countryRegion: row.country_region,
    status: row.status,
    locale: row.locale,
    source: row.source,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    nextFollowUpAt: row.next_follow_up_at,
  }
}

export interface InquiryItemView {
  productSlug: string
  applicationSlug: string
  estimatedQuantity: number
  spec: Record<string, unknown>
}

export interface InquiryActivityView {
  activityType: string
  createdAt: string
  payload: Record<string, unknown>
}

export interface InquiryDetail extends InquirySummary {
  projectDescription: string
  items: InquiryItemView[]
  activities: InquiryActivityView[]
}

export function mapInquiryDetail(
  inquiry: InquiryRow,
  items: Array<{ product_slug: string; application_slug: string; estimated_quantity: number; spec: Record<string, unknown> }>,
  activities: Array<{ activity_type: string; created_at: string; payload: Record<string, unknown> }>,
): InquiryDetail {
  return {
    ...mapInquirySummary(inquiry),
    projectDescription: inquiry.project_description ?? '',
    items: items.map((it) => ({
      productSlug: it.product_slug,
      applicationSlug: it.application_slug,
      estimatedQuantity: it.estimated_quantity,
      spec: it.spec,
    })),
    activities: activities.map((a) => ({
      activityType: a.activity_type,
      createdAt: a.created_at,
      payload: a.payload,
    })),
  }
}

const ITEMS_PER_PAGE = 25

/**
 * List inquiries for the admin console. `productSlug` / `applicationSlug`
 * narrow the result by joining through `inquiry_items`; an empty join result
 * short-circuits to an empty list (no inquiry matches the product filter).
 */
export async function queryInquiries(
  filters: InquiryFilters,
  client: SupabaseClient,
): Promise<InquirySummary[]> {
  let matchingIds: string[] | null = null
  if (filters.productSlug || filters.applicationSlug) {
    let itemsQuery = client.from('inquiry_items').select('inquiry_id')
    if (filters.productSlug) itemsQuery = itemsQuery.eq('product_slug', filters.productSlug)
    if (filters.applicationSlug) itemsQuery = itemsQuery.eq('application_slug', filters.applicationSlug)
    const { data: itemRows, error: itemErr } = await itemsQuery
    if (itemErr) throw new Error(`inquiry_items query failed: ${itemErr.message}`)
    matchingIds = (itemRows ?? []).map((r: { inquiry_id: string }) => r.inquiry_id)
    if (matchingIds.length === 0) return []
  }

  let query = client.from('inquiries').select(SUMMARY_COLUMNS)
  query = applyInquiryFilters(
    query as unknown as ChainableQuery,
    buildInquiryFilterClauses(filters),
  ) as unknown as typeof query
  if (matchingIds) query = query.in('id', matchingIds)
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1)

  if (error) throw new Error(`inquiries query failed: ${error.message}`)
  return (data ?? []).map((row: InquiryRow) => mapInquirySummary(row))
}

/** Fetch one inquiry with its line items and activity timeline. */
export async function getInquiryDetail(
  id: string,
  client: SupabaseClient,
): Promise<InquiryDetail | null> {
  const { data: inquiry, error: inquiryErr } = await client
    .from('inquiries')
    .select(`${SUMMARY_COLUMNS}, project_description`)
    .eq('id', id)
    .single()
  if (inquiryErr) throw new Error(`inquiry fetch failed: ${inquiryErr.message}`)
  if (!inquiry) return null

  const [{ data: items }, { data: activities }] = await Promise.all([
    client.from('inquiry_items').select('product_slug, application_slug, estimated_quantity, spec').eq('inquiry_id', id),
    client.from('inquiry_activities').select('activity_type, created_at, payload').eq('inquiry_id', id).order('created_at', { ascending: true }),
  ])

  return mapInquiryDetail(
    inquiry as InquiryRow,
    (items ?? []) as Array<{ product_slug: string; application_slug: string; estimated_quantity: number; spec: Record<string, unknown> }>,
    (activities ?? []) as Array<{ activity_type: string; created_at: string; payload: Record<string, unknown> }>,
  )
}

export interface InquiryAttachmentView {
  id: string
  storageKey: string
  displayName: string
  contentType: string
  sizeBytes: number
  createdAt: string
}

/** List the artwork files attached to an inquiry (WIZ-staff only via service client). */
export async function getInquiryAttachments(
  id: string,
  client: SupabaseClient,
): Promise<InquiryAttachmentView[]> {
  const { data, error } = await client
    .from('inquiry_attachments')
    .select('id, storage_key, display_name, content_type, size_bytes, created_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`inquiry_attachments query failed: ${error.message}`)
  return (data ?? []).map((r: {
    id: string
    storage_key: string
    display_name: string
    content_type: string
    size_bytes: number
    created_at: string
  }) => ({
    id: r.id,
    storageKey: r.storage_key,
    displayName: r.display_name,
    contentType: r.content_type,
    sizeBytes: r.size_bytes,
    createdAt: r.created_at,
  }))
}
