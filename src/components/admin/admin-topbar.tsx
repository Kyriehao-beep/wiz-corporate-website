'use client'

import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'

export function AdminTopbar() {
  const t = useTranslations('admin')

  return (
    <header className="admin-topbar">
      <h1 className="admin-topbar__title">{t('navDashboard')}</h1>
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
