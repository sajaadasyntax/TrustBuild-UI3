"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Trash2, Filter, BellOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { adminApi } from '@/lib/adminApi'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

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

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAdminNotifications({
        unreadOnly: filter === 'unread',
        limit: 100,
      })
      setNotifications(response.data?.notifications || [])
      setUnreadCount(response.data?.unreadCount || 0)
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await adminApi.getAdminUnreadCount()
      setUnreadCount(response.data?.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && admin) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [authLoading, admin, fetchNotifications, fetchUnreadCount])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminApi.markAdminNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark notification as read',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllAdminNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark all notifications as read',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await adminApi.deleteAdminNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast({
        title: 'Success',
        description: 'Notification deleted',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notification',
        variant: 'destructive',
      })
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }
    if (notification.actionLink) {
      // Use Next.js router for client-side navigation
      router.push(notification.actionLink)
    }
  }

  // Get notification type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  // Get notification icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✓'
      case 'WARNING':
        return '⚠'
      case 'ERROR':
        return '✕'
      default:
        return 'ℹ'
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  if (authLoading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated on important system events and admin actions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} unread
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {notifications.length} total notifications
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                          !notification.isRead ? 'bg-accent/30 border-l-primary' : 'border-l-transparent'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 border ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              <span className="text-lg font-semibold">
                                {getTypeIcon(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm mb-1">
                                    {notification.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true,
                                      })}
                                    </span>
                                    {notification.metadata?.action && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">
                                          {notification.metadata.action}
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleMarkAsRead(notification.id)
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(notification.id)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {notification.actionLink && notification.actionText && (
                                <div className="mt-3">
                                  <Link
                                    href={notification.actionLink}
                                    className="text-sm text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {notification.actionText} →
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

