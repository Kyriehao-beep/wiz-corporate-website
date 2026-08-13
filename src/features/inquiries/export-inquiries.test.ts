import { describe, expect, it } from 'vitest'
import { exportInquiries, type InquiryExportRow } from './export-inquiries'

const rows: InquiryExportRow[] = [
  {
    inquiryNumber: 'WIZ-20260812-000001',
    companyName: 'Acme',
    status: 'new',
    owner: 'sales',
    createdAt: '2026-08-12T10:00:00Z',
  },
]

describe('exportInquiries', () => {
  it('exports filtered metadata without private file paths or notes', async () => {
    const csv = await exportInquiries(rows)
    expect(csv).toContain('inquiry_number,company_name,status,owner,created_at')
    expect(csv).not.toContain('storage_path')
    expect(csv).not.toContain('internal_note')
  })

  it('escapes formula-injection prefixes', async () => {
    const csv = await exportInquiries([{ ...rows[0], companyName: '=cmd' }])
    expect(csv).toContain("'=cmd")
    // No CSV line may begin with a raw formula trigger.
    expect(csv).not.toMatch(/^=cmd/m)
  })

  it('quotes values containing commas', async () => {
    const csv = await exportInquiries([{ ...rows[0], companyName: 'Acme, Inc' }])
    expect(csv).toContain('"Acme, Inc"')
  })
})
