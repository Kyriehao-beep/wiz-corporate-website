import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { routing } from '@/i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const LOCALE_PREFIX = /^\/(en|ja|zh-CN)\b/
const LOGIN_ROUTE = /^\/(en|ja|zh-CN)\/login$/
const ADMIN_ROUTE = /^\/(en|ja|zh-CN)\/admin(\/|$)/

type WizLocale = 'en' | 'ja' | 'zh-CN'

function localeOf(pathname: string): WizLocale {
  return (pathname.match(LOCALE_PREFIX)?.[1] as WizLocale) ?? routing.defaultLocale
}

/**
 * Next 16 proxy (former middleware).
 *
 * Two responsibilities, in order:
 *  1. next-intl locale routing (adds/normalises the `/en|/ja|/zh-CN` prefix).
 *  2. Supabase auth session refresh + coarse route guards for the admin area.
 *
 * The Supabase step is skipped entirely when the project has no Supabase
 * credentials yet, so the public marketing site keeps working standalone.
 */
export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request)

  // A locale redirect/rewrite decision wins — re-run on the next request.
  if (response.status >= 300 && response.status < 400) {
    return response
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Touching getUser() is what refreshes the auth cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const locale = localeOf(pathname)

  if (ADMIN_ROUTE.test(pathname) && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (LOGIN_ROUTE.test(pathname) && user) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url))
  }

  return response
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
