import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from '@/i18n/locales'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'always',
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
