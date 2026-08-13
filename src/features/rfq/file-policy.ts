export interface FileDescriptor {
  name: string
  size: number
  type: string
}

export type FilePolicyResult = { ok: true } | { ok: false; reason: string }

export const MAX_FILES = 5
export const MAX_FILE_BYTES = 20 * 1024 * 1024
export const MAX_AGGREGATE_BYTES = 100 * 1024 * 1024

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'eps', 'svg'] as const

// Acceptable MIME prefixes per allowed extension. Used to reject renamed executables.
const EXTENSION_MIME: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  pdf: ['application/pdf'],
  ai: ['application/postscript', 'application/illustrator', 'application/pdf'],
  eps: ['application/postscript', 'image/x-eps'],
  svg: ['image/svg+xml'],
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export function validateFileDescriptor(file: FileDescriptor): FilePolicyResult {
  const ext = extensionOf(file.name)
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return { ok: false, reason: 'unsupported file type' }
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, reason: 'empty file' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, reason: 'file exceeds the 20 MB per-file limit' }
  }
  if (file.type && !EXTENSION_MIME[ext].some((mime) => file.type.toLowerCase().startsWith(mime))) {
    return { ok: false, reason: 'MIME type does not match file extension' }
  }
  return { ok: true }
}

export function validateAggregateSize(sizes: number[]): FilePolicyResult {
  if (sizes.length > MAX_FILES) {
    return { ok: false, reason: `at most ${MAX_FILES} files may be uploaded` }
  }
  const total = sizes.reduce((sum, size) => sum + (Number.isFinite(size) ? size : 0), 0)
  if (total > MAX_AGGREGATE_BYTES) {
    return { ok: false, reason: 'total upload size exceeds the 100 MB limit' }
  }
  return { ok: true }
}
