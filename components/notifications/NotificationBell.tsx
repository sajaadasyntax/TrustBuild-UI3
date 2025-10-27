"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, Trash2, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const [open, setOpen] = useState(false)

  // Get notification type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50'
      case 'ERROR':
        return 'text-red-600 bg-red-50'
      case 'COMMISSION_DUE':
      case 'COMMISSION_OVERDUE':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-blue-600 bg-blue-50'
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
    if (notification.actionLink) {
      setOpen(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const recentNotifications = notifications.slice(0, 10)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </Link>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        )}

        {!loading && recentNotifications.length === 0 && (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}

        {!loading && recentNotifications.length > 0 && (
          <ScrollArea className="h-[400px]">
            {recentNotifications.map((notification) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`flex-col items-start p-4 cursor-pointer ${
                    !notification.isRead ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  asChild
                >
                  <div>
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex gap-2 flex-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          <span className="text-sm font-semibold">
                            {getTypeIcon(notification.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-tight">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {notification.actionLink && (
                              <Link
                                href={notification.actionLink}
                                className="text-xs text-primary hover:underline"
                                onClick={() => setOpen(false)}
                              >
                                {notification.actionText || 'View'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
            ))}
          </ScrollArea>
        )}

        {!loading && notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/notifications"
                className="w-full cursor-pointer text-center text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                View all notifications ({notifications.length})
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

