'use client'

import { useTranslations } from 'next-intl'
import { LayoutDashboard, FileText, Boxes, Inbox, Settings } from 'lucide-react'

const items = [
  { key: 'navDashboard', href: '#', icon: LayoutDashboard },
  { key: 'navRfq', href: '#', icon: FileText },
  { key: 'navProducts', href: '#', icon: Boxes },
  { key: 'navInquiries', href: '#', icon: Inbox },
  { key: 'navSettings', href: '#', icon: Settings },
] as const

export function AdminSidebar() {
  const t = useTranslations('admin')
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
          return (
            <a key={item.key} href={item.href} className="admin-nav__item">
              <Icon aria-hidden="true" size={18} />
              <span>{t(item.key)}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
