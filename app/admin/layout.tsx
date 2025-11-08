"use client"

import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { AdminNotificationProvider } from '@/contexts/AdminNotificationContext'
import { AdminNavigationNew } from '@/components/layout/admin-navigation-new'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminNotificationProvider>
        <AdminNavigationNew />
        {children}
      </AdminNotificationProvider>
    </AdminAuthProvider>
  )
}

