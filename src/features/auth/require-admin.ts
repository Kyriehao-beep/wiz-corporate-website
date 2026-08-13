import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export type WizLocale = 'en' | 'ja' | 'zh-CN'

export interface AdminProfile {
  id: string
  displayName: string
  role: string
}

/**
 * Guard for authenticated WIZ admin/sales/staff pages. Redirects anonymous
 * users to the localized login route. On success returns the named profile.
 */
export async function requireAdmin(locale: WizLocale): Promise<AdminProfile> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    redirect(`/${locale}/login?reason=profile`)
  }

  return {
    id: data.id,
    displayName: data.display_name,
    role: data.role,
  }
}
