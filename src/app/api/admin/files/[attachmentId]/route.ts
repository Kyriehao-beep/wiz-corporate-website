import { NextRequest } from 'next/server'

import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireApiAdmin } from '@/features/auth/require-api-admin'
import { RFQ_ATTACHMENT_BUCKET } from '@/features/inquiries/attachments'

export const dynamic = 'force-dynamic'

/** Short-lived signed URL lifetime for private attachment downloads. */
const SIGNED_URL_TTL_SECONDS = 5 * 60

/**
 * Authenticated, expiring download redirect for a private inquiry attachment.
 * Auth is checked twice: the caller must be a WIZ member, and the attachment
 * record must exist (proving it belongs to a real inquiry). The signed URL is
 * valid for five minutes and opened as a download.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const admin = await requireApiAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const { attachmentId } = await params
  if (!attachmentId) return new Response('Bad Request', { status: 400 })

  // Verify the record exists and the caller may see it (member RLS applies).
  const memberClient = await createServerClient()
  const { data: attachment, error: lookupError } = await memberClient
    .from('inquiry_attachments')
    .select('id, storage_key, display_name, content_type')
    .eq('id', attachmentId)
    .single()
  if (lookupError || !attachment) {
    return new Response('Not Found', { status: 404 })
  }

  // Service role issues the signed URL (bypasses storage RLS).
  const serviceClient = createServiceClient()
  const { data: signed, error: signError } = await serviceClient.storage
    .from(RFQ_ATTACHMENT_BUCKET)
    .createSignedUrl(attachment.storage_key, SIGNED_URL_TTL_SECONDS, {
      download: attachment.display_name || true,
    })
  if (signError || !signed?.signedUrl) {
    return new Response('Signed URL failed', { status: 502 })
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: signed.signedUrl,
      'Cache-Control': 'no-store',
    },
  })
}
