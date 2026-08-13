/**
 * Safe CSV export for the inquiry admin list. Only non-sensitive metadata columns are emitted;
 * storage paths, internal notes, and contact PII beyond company name are intentionally excluded.
 * Output is UTF-8 with a BOM for spreadsheet compatibility and escapes formula-injection prefixes.
 */

export interface InquiryExportRow {
  inquiryNumber: string
  companyName: string
  status: string
  owner: string
  createdAt: string
}

const COLUMNS: { key: keyof InquiryExportRow; header: string }[] = [
  { key: 'inquiryNumber', header: 'inquiry_number' },
  { key: 'companyName', header: 'company_name' },
  { key: 'status', header: 'status' },
  { key: 'owner', header: 'owner' },
  { key: 'createdAt', header: 'created_at' },
]

function escapeCell(value: string): string {
  // Prevent CSV formula injection: prefix cells that begin with = + - @
  if (/^[=+\-@]/.test(value)) return `'${value}`
  return value
}

function quoteCell(value: string): string {
  const escaped = escapeCell(value)
  if (/[",\n\r]/.test(escaped)) return `"${escaped.replace(/"/g, '""')}"`
  return escaped
}

export async function exportInquiries(rows: InquiryExportRow[]): Promise<string> {
  const header = COLUMNS.map((column) => column.header).join(',')
  const body = rows
    .map((row) => COLUMNS.map((column) => quoteCell(String(row[column.key]))).join(','))
    .join('\n')
  return `﻿${header}\n${body}\n`
}
