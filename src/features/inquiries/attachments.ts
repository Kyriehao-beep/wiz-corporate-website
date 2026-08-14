import { randomUUID } from 'node:crypto'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  MAX_FILES,
  validateAggregateSize,
  validateFileDescriptor,
  type FileDescriptor,
  type FilePolicyResult,
} from '@/features/rfq/file-policy'

/** Bucket that holds RFQ artwork (private — only WIZ staff + the submitter's flow). */
export const RFQ_ATTACHMENT_BUCKET = 'rfq-private'

/** Bucket that holds uploaded PDF quotations (private — WIZ staff only). */
export const QUOTE_BUCKET = 'quote-private'

/** Metadata returned by the upload endpoint and stored against the inquiry. */
export interface AttachmentMeta {
  storageKey: string
  displayName: string
  contentType: string
  sizeBytes: number
}

/** Minimal file shape accepted by the server-side uploader (web `File` satisfies it). */
export interface UploadFile {
  name: string
  size: number
  type: string
  arrayBuffer(): Promise<ArrayBuffer>
}

/** Lowercase + strip unsafe characters so the key is storage-safe and non-overlapping. */
export function sanitizeFileName(name: string): string {
  const base = name
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/_+(?=\.)/g, '') // never leave an underscore directly before a dot
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
  return base.length > 80 ? base.slice(0, 80) : base || 'file'
}

/** Deterministic, collision-free storage path under the RFQ bucket. Pure + tested. */
export function buildStorageKey(fileName: string): string {
  return `rfq/${randomUUID()}-${sanitizeFileName(fileName)}`
}

/**
 * Pure, infrastructure-free validation of a proposed attachment set.
 * Enforces per-file policy AND the aggregate (count + total bytes) policy.
 */
export function validateAttachmentSet(files: FileDescriptor[]): FilePolicyResult {
  if (files.length === 0) return { ok: true }
  const agg = validateAggregateSize(files.map((f) => f.size))
  if (!agg.ok) return agg
  for (const file of files) {
    const result = validateFileDescriptor(file)
    if (!result.ok) return result
  }
  return { ok: true }
}

/**
 * Server-only: stream each file into the RFQ bucket and return its stored metadata.
 * Throws on the first storage failure — callers should surface a generic error
 * rather than leaking storage internals.
 */
export async function uploadFilesToStorage(
  client: SupabaseClient,
  files: UploadFile[],
): Promise<AttachmentMeta[]> {
  const metas: AttachmentMeta[] = []
  for (const file of files) {
    const storageKey = buildStorageKey(file.name)
    const buffer = await file.arrayBuffer()
    const { error } = await client.storage
      .from(RFQ_ATTACHMENT_BUCKET)
      .upload(storageKey, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
        cacheControl: '3600',
      })
    if (error) {
      throw new Error(`storage upload failed for ${file.name}: ${error.message}`)
    }
    metas.push({
      storageKey,
      displayName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    })
  }
  return metas
}

/**
 * Server-only: persist attachment rows linked to a freshly created inquiry.
 * The storage objects already exist; this only records the references.
 */
export async function linkAttachments(
  client: SupabaseClient,
  inquiryId: string,
  metas: AttachmentMeta[],
): Promise<void> {
  if (metas.length === 0) return
  const rows = metas.map((m) => ({
    inquiry_id: inquiryId,
    storage_key: m.storageKey,
    display_name: m.displayName,
    content_type: m.contentType,
    size_bytes: m.sizeBytes,
  }))
  const { error } = await client.from('inquiry_attachments').insert(rows)
  if (error) {
    throw new Error(`failed to link attachments: ${error.message}`)
  }
}
