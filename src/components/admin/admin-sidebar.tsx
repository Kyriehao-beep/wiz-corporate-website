'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Boxes, Inbox, Settings } from 'lucide-react'

const items = [
  { key: 'navDashboard', segment: '/admin', icon: LayoutDashboard },
  { key: 'navRfq', segment: '/admin/rfq', icon: FileText },
  { key: 'navProducts', segment: '/admin/products', icon: Boxes },
  { key: 'navInquiries', segment: '/admin/inquiries', icon: Inbox },
  { key: 'navSettings', segment: '/admin/settings', icon: Settings },
] as const

export function AdminSidebar() {
  const t = useTranslations('admin')
  const locale = useLocale()
  const pathname = usePathname()
  const consoleWord = t('consoleName').replace('WIZ ', '')

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__mark" aria-hidden="true">W</span>
        <span className="admin-sidebar__name">WIZ</span>
        <span className="admin-sidebar__console">{consoleWord}</span>
      </div>
      <nav className="admin-nav" aria-label={t('consoleName')}>
        {items.map((item) => {
          const Icon = item.icon
          const href = `/${locale}${item.segment}`
          const active = pathname === `/${locale}${item.segment}`
          return (
            <a
              key={item.key}
              href={href}
              className={`admin-nav__item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon aria-hidden="true" size={18} />
              <span>{t(item.key)}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
