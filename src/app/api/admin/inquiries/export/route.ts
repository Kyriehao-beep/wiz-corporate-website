import { NextRequest } from 'next/server'

import { createServerClient } from '@/lib/supabase/server'
import { requireApiAdmin } from '@/features/auth/require-api-admin'
import { queryInquiries, type InquiryFilters } from '@/features/inquiries/query-inquiries'
import { exportInquiries, type InquiryExportRow } from '@/features/inquiries/export-inquiries'
import { INQUIRY_STATUSES } from '@/features/inquiries/lifecycle'
import { isLocale } from '@/i18n/locales'

export const dynamic = 'force-dynamic'

function first(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key)?.trim()
  return v ? v : undefined
}

/**
 * Authenticated, filtered CSV export of inquiries. Respects the active admin
 * filters passed as query params and emits only non-sensitive metadata columns
 * (no storage paths, no internal notes). See export-inquiries.ts for the
 * BOM + formula-injection escaping guarantees.
 */
export async function GET(request: NextRequest) {
  const admin = await requireApiAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const params = request.nextUrl.searchParams
  const filters: InquiryFilters = {}

  const status = first(params, 'status')
  if (status && INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number])) {
    filters.status = status as InquiryFilters['status']
  }
  const locale = first(params, 'locale')
  if (locale && isLocale(locale)) filters.locale = locale

  for (const key of [
    'inquiryNumber',
    'company',
    'contact',
    'email',
    'ownerId',
    'source',
    'country',
    'productSlug',
    'applicationSlug',
    'dateFrom',
    'dateTo',
    'projectText',
  ] as const) {
    const v = first(params, key)
    if (v) (filters as Record<string, unknown>)[key] = v
  }

  const client = await createServerClient()
  const rows = await queryInquiries(filters, client, { all: true })
  const exportRows: InquiryExportRow[] = rows.map((r) => ({
    inquiryNumber: r.inquiryNumber,
    companyName: r.companyName,
    status: r.status,
    owner: r.ownerId ?? '',
    createdAt: r.createdAt,
  }))
  const csv = await exportInquiries(exportRows)

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inquiries-export.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
