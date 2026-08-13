'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { WizLocale } from './require-admin'

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  locale: z.enum(['en', 'ja', 'zh-CN']),
})

export interface AuthState {
  error?: string
}

/**
 * Server Action: email/password sign-in. Always returns a generic
 * `invalid_credentials` error so it never reveals which field was wrong.
 * On success it redirects to the localized admin dashboard.
 */
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    locale: formData.get('locale'),
  })

  if (!parsed.success) {
    return { error: 'invalid_credentials' }
  }

  const { email, password, locale } = parsed.data
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'invalid_credentials' }
  }

  redirect(`/${locale}/admin`)
}

/**
 * Server Action: sign out and return to the localized login route.
 */
export async function logout(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as WizLocale) || 'zh-CN'
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}
