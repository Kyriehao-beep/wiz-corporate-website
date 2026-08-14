import { createServerClient } from '@/lib/supabase/server'

/**
 * Admin guard for API routes (JSON/CSV endpoints). Unlike `requireAdmin`, which
 * redirects to the login page, this returns `null` when the caller is not an
 * authenticated WIZ member so the route can reply with a 401/403 Response.
 */
export async function requireApiAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()
  if (!profile) return null

  return { userId: user.id }
}
