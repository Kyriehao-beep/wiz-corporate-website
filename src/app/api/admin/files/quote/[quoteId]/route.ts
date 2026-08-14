import { NextRequest } from 'next/server'

import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireApiAdmin } from '@/features/auth/require-api-admin'
import { QUOTE_BUCKET } from '@/features/inquiries/attachments'

export const dynamic = 'force-dynamic'

const SIGNED_URL_TTL_SECONDS = 5 * 60

/**
 * Authenticated, expiring download redirect for a quote's PDF stored in the
 * quote-private bucket. Auth is checked (WIZ member) and the quote row must
 * exist with a PDF before a signed URL is issued. Valid for five minutes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const admin = await requireApiAdmin()
  if (!admin) return new Response('Unauthorized', { status: 401 })

  const { quoteId } = await params
  if (!quoteId) return new Response('Bad Request', { status: 400 })

  const memberClient = await createServerClient()
  const { data: quote, error: lookupError } = await memberClient
    .from('inquiry_quotes')
    .select('id, pdf_storage_key')
    .eq('id', quoteId)
    .single()
  if (lookupError || !quote || !quote.pdf_storage_key) {
    return new Response('Not Found', { status: 404 })
  }

  const serviceClient = createServiceClient()
  const { data: signed, error: signError } = await serviceClient.storage
    .from(QUOTE_BUCKET)
    .createSignedUrl(quote.pdf_storage_key, SIGNED_URL_TTL_SECONDS, { download: true })
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
