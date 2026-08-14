import { describe, it, expect } from 'vitest'

import {
  sanitizeFileName,
  buildStorageKey,
  validateAttachmentSet,
  type AttachmentMeta,
} from './attachments'

describe('sanitizeFileName', () => {
  it('lowercases and strips unsafe characters', () => {
    expect(sanitizeFileName('My Logo!.AI')).toBe('my_logo.ai')
  })
  it('collapses repeats and trims edge underscores', () => {
    expect(sanitizeFileName('__a  b__')).toBe('a_b')
  })
  it('falls back to a safe default for empty input', () => {
    expect(sanitizeFileName('!!!')).toBe('file')
  })
  it('truncates very long names', () => {
    const long = 'x'.repeat(200) + '.pdf'
    expect(sanitizeFileName(long).length).toBeLessThanOrEqual(80)
  })
})

describe('buildStorageKey', () => {
  it('produces a unique rfq/ prefixed path', () => {
    const a = buildStorageKey('art.pdf')
    const b = buildStorageKey('art.pdf')
    expect(a).toMatch(/^rfq\/[0-9a-f-]+-art\.pdf$/)
    expect(a).not.toBe(b)
  })
})

describe('validateAttachmentSet', () => {
  const ok = (name: string, size: number, type: string) => ({ name, size, type })

  it('accepts an empty set', () => {
    expect(validateAttachmentSet([]).ok).toBe(true)
  })

  it('accepts a small valid set', () => {
    const r = validateAttachmentSet([
      ok('art.pdf', 1024, 'application/pdf'),
      ok('logo.png', 2048, 'image/png'),
    ])
    expect(r.ok).toBe(true)
  })

  it('rejects too many files', () => {
    const set = Array.from({ length: 6 }, (_, i) => ok(`f${i}.png`, 10, 'image/png'))
    const r = validateAttachmentSet(set)
    expect(r.ok).toBe(false)
  })

  it('rejects a disallowed extension', () => {
    const r = validateAttachmentSet([ok('evil.exe', 10, 'application/octet-stream')])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/unsupported/)
  })

  it('rejects an oversized aggregate', () => {
    const set = [
      ok('a.pdf', 60 * 1024 * 1024, 'application/pdf'),
      ok('b.pdf', 60 * 1024 * 1024, 'application/pdf'),
    ]
    const r = validateAttachmentSet(set)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/100 MB/)
  })
})

// Compile-time shape check for AttachmentMeta usage in callers.
const _meta: AttachmentMeta = {
  storageKey: 'rfq/x-y.pdf',
  displayName: 'y.pdf',
  contentType: 'application/pdf',
  sizeBytes: 1,
}
void _meta
