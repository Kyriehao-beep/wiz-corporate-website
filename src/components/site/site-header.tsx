'use client'

import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { LocaleSwitcher } from '@/components/site/locale-switcher'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/locales'

const navigation = [
  { key: 'products', path: '/products' },
  { key: 'applications', path: '/applications' },
  { key: 'process', path: '/custom-process' },
  { key: 'capabilities', path: '/capabilities' },
  { key: 'about', path: '/about' },
] as const

export function SiteHeader({ locale }: { locale: Locale }) {
  const nav = useTranslations('navigation')
  const rfq = useTranslations('rfq')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <a aria-label="WIZ home" className="brand" href={`/${locale}`}>
          <span className="brand__mark" aria-hidden="true">W</span>
          <span className="brand__name">WIZ</span>
          <span className="brand__descriptor">Rubber Patch<br />Manufacturing</span>
        </a>

        <nav aria-label={nav('primaryLabel')} className="desktop-nav">
          {navigation.map((item) => (
            <a href={`/${locale}${item.path}`} key={item.key}>{nav(item.key)}</a>
          ))}
        </nav>

        <div className="site-header__actions">
          <LocaleSwitcher locale={locale} />
          <ButtonLink className="header-rfq" href={`/${locale}/rfq`}>
            {rfq('cta')}
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? nav('menuClose') : nav('menuOpen')}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <nav aria-label={nav('mobileLabel')} className="mobile-nav">
          <Container>
            {navigation.map((item) => (
              <a href={`/${locale}${item.path}`} key={item.key}>{nav(item.key)}</a>
            ))}
            <ButtonLink href={`/${locale}/rfq`}>{rfq('cta')}</ButtonLink>
          </Container>
        </nav>
      ) : null}
    </header>
  )
}
