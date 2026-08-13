import type { ReactNode } from 'react'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopbar } from '@/components/admin/admin-topbar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-body">
        <AdminTopbar />
        <main id="main-content" className="admin-content">{children}</main>
      </div>
    </div>
  )
}
