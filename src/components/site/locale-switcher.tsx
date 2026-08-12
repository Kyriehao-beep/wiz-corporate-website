'use client'

import { Check, ChevronDown, Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { locales, type Locale } from '@/i18n/locales'

const languageNames: Record<Locale, string> = {
  en: 'EN',
  ja: '日本語',
  'zh-CN': '中文',
}

export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/')
  const currentLocale = segments[1]

  if (locales.includes(currentLocale as Locale)) {
    segments[1] = locale
    return segments.join('/') || `/${locale}`
  }

  return `/${locale}${pathname === '/' ? '' : pathname}`
}

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const t = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="language-switcher">
      <button
        aria-expanded={isOpen}
        aria-label={t('changeLanguage')}
        className="language-switcher__trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <Languages aria-hidden="true" size={17} strokeWidth={1.7} />
        <span>{languageNames[locale]}</span>
        <ChevronDown aria-hidden="true" size={14} strokeWidth={1.7} />
      </button>
      {isOpen ? (
        <div aria-label={t('language')} className="language-switcher__menu" role="menu">
          {locales.map((option) => (
            <a
              className="language-switcher__option"
              href={localizePath(pathname, option)}
              key={option}
              lang={option}
              role="menuitem"
            >
              <span>{languageNames[option]}</span>
              {option === locale ? <Check aria-hidden="true" size={15} /> : null}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
