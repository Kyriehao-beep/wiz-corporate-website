import { describe, expect, it } from 'vitest'
import { validateAggregateSize, validateFileDescriptor, type FileDescriptor } from './file-policy'

const MB = 1024 * 1024

function fileDescriptor(extension: string, sizeBytes: number, mime?: string): FileDescriptor {
  return { name: `artwork.${extension}`, size: sizeBytes, type: mime ?? '' }
}

describe('file-policy', () => {
  it.each(['jpg', 'jpeg', 'png', 'pdf', 'ai', 'eps', 'svg'])('accepts .%s', (extension) => {
    expect(validateFileDescriptor(fileDescriptor(extension, 1024))).toEqual({ ok: true })
  })

  it('rejects a renamed executable and aggregate size over 100 MB', () => {
    expect(validateFileDescriptor(fileDescriptor('jpg', 1024, 'application/x-msdownload')).ok).toBe(false)
    expect(validateAggregateSize([60 * MB, 41 * MB]).ok).toBe(false)
  })

  it('rejects a zero-byte file and a file above the 20 MB per-file cap', () => {
    expect(validateFileDescriptor(fileDescriptor('png', 0)).ok).toBe(false)
    expect(validateFileDescriptor(fileDescriptor('png', 21 * MB)).ok).toBe(false)
  })
})
