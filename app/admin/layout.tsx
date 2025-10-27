"use client"

import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { AdminNavigationNew } from '@/components/layout/admin-navigation-new'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminNavigationNew />
      {children}
    </AdminAuthProvider>
  )
}

