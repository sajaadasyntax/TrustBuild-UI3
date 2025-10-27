"use client"

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    subscribeToWebPush,
    unsubscribeFromWebPush,
    isPushEnabled,
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Get notification type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'COMMISSION_DUE':
      case 'COMMISSION_OVERDUE':
        return 'text-orange-600 bg-orange-50 border-orange-200'
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
      case 'COMMISSION_DUE':
      case 'COMMISSION_OVERDUE':
        return '£'
      default:
        return 'ℹ'
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
  }

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  const handleTogglePush = async () => {
    if (isPushEnabled) {
      await unsubscribeFromWebPush()
    } else {
      await subscribeToWebPush()
    }
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Stay updated with your account activity and important alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                onClick={deleteAllNotifications}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main notifications list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">All Notifications</CardTitle>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread {unreadCount > 0 && `(${unreadCount})`}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="p-8 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              )}

              {!loading && filteredNotifications.length === 0 && (
                <div className="p-8 text-center">
                  <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'unread'
                      ? "You're all caught up!"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              )}

              {!loading && filteredNotifications.length > 0 && (
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
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold">{notification.title}</h4>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              {notification.actionLink && (
                                <Link href={notification.actionLink}>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                    {notification.actionText || 'View'} →
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notifications even when offline
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={isPushEnabled}
                  onCheckedChange={handleTogglePush}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unread</span>
                    <span className="font-medium text-primary">{unreadCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Read</span>
                    <span className="font-medium">{notifications.length - unreadCount}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">About Notifications</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We'll notify you about important updates like job status changes, payment
                  confirmations, new reviews, and system alerts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

