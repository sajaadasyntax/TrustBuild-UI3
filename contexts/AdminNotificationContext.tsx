"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from './AdminAuthContext'
import { adminApi } from '@/lib/adminApi'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionLink?: string
  actionText?: string
  metadata?: any
  createdAt: string
}

interface AdminNotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined)

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { admin } = useAdminAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!admin) return

    setLoading(true)
    try {
      const response = await adminApi.getAdminNotifications({ limit: 50 })
      setNotifications(response.data?.notifications || [])
      setUnreadCount(response.data?.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching admin notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [admin])

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!admin) return

    try {
      const response = await adminApi.getAdminUnreadCount()
      setUnreadCount(response.data?.count || 0)
    } catch (error) {
      console.error('Error fetching admin unread count:', error)
    }
  }, [admin])

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await adminApi.markAdminNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await adminApi.markAllAdminNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await adminApi.deleteAdminNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      
      // Update unread count if it was unread
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (admin) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [admin, fetchNotifications, fetchUnreadCount])

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  )
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationContext)
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider')
  }
  return context
}

