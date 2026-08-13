import { createClient } from '@supabase/supabase-js'

/**
 * Privileged server-only client using the service role key. BYPASSES RLS.
 * Only for trusted server code: seeds, webhooks, scheduled jobs, storage moves.
 * Throws at call time if the secret is absent so it can never silently run
 * unprivileged.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the service client')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
