"use client"

import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { AdminNavigation } from '@/components/layout/admin-navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminNavigation />
      {children}
    </AdminAuthProvider>
  )
}

