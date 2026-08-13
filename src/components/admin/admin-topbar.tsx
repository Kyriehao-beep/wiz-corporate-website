'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

const TITLES: Record<string, 'navDashboard' | 'navRfq' | 'navProducts' | 'navInquiries' | 'navSettings'> = {
  '/admin': 'navDashboard',
  '/admin/rfq': 'navRfq',
  '/admin/products': 'navProducts',
  '/admin/inquiries': 'navInquiries',
  '/admin/settings': 'navSettings',
}

export function AdminTopbar() {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const localPath = pathname.replace(/^\/[^/]+/, '') || '/'
  const titleKey = TITLES[localPath] ?? 'navDashboard'

  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar__title">{t(titleKey)}</h1>
      <div className="admin-user">
        <span className="admin-role-chip">{t('roleAdmin')}</span>
        <button type="button" className="admin-signout">
          <LogOut aria-hidden="true" size={15} />
          {t('signOut')}
        </button>
      </div>
    </header>
  )
}
