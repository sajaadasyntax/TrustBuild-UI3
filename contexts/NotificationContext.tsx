"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as notificationApi from '@/lib/notificationApi'
import type { Notification } from '@/lib/notificationApi'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  subscribeToWebPush: () => Promise<void>
  unsubscribeFromWebPush: () => Promise<void>
  isPushEnabled: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  // Check if push notifications are supported and enabled
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushEnabled(!!subscription)
        })
      })
    }
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    // Check if token exists before making request
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      // No token, silently skip
      return
    }

    setLoading(true)
    try {
      const data = await notificationApi.getNotifications({ limit: 50 })
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error: any) {
      // Silently handle 401 errors (expected when not authenticated or token expired)
      if (error.isUnauthorized || error.status === 401) {
        // Token might be expired or invalid, silently skip
        return
      }
      // Only log other errors
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return

    // Check if token exists before making request
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      // No token, silently skip
      return
    }

    try {
      const count = await notificationApi.getUnreadCount()
      setUnreadCount(count)
    } catch (error: any) {
      // Silently handle 401 errors (expected when not authenticated or token expired)
      if (error.isUnauthorized || error.status === 401) {
        // Token might be expired or invalid, silently skip
        return
      }
      // Only log other errors
      console.error('Error fetching unread count:', error)
    }
  }, [user])

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId)
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
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId)
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

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await notificationApi.deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  // Subscribe to web push
  const subscribeToWebPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in your browser')
      return
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications to receive updates')
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key
      const publicKey = await notificationApi.getVapidPublicKey()

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to backend
      await notificationApi.subscribeToPush(subscription, 'web')
      setIsPushEnabled(true)
      
      console.log('Successfully subscribed to push notifications')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      alert('Failed to enable push notifications')
    }
  }

  // Unsubscribe from web push
  const unsubscribeFromWebPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await notificationApi.unsubscribeFromPush(subscription.endpoint)
        setIsPushEnabled(false)
        console.log('Successfully unsubscribed from push notifications')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user, fetchNotifications, fetchUnreadCount])

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    subscribeToWebPush,
    unsubscribeFromWebPush,
    isPushEnabled,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Helper function to convert URL-safe Base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

