"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  // Refresh notifications when dropdown opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      fetchNotifications()
    }
  }

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
      // Use Next.js router for client-side navigation
      router.push(notification.actionLink)
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
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
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
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-muted-foreground">Loading notifications...</span>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center">No notifications</span>
              <span className="text-xs text-muted-foreground mt-1 text-center">You're all caught up!</span>
            </div>
          ) : (
            recentNotifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`flex-col items-start p-3 cursor-pointer hover:bg-accent ${
                    !notification.isRead ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex gap-2 flex-1 min-w-0">
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
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
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
                            <span className="text-xs text-primary">
                              {notification.actionText || 'View'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(e, notification.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
                {index < recentNotifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1">
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
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/notifications"
                  className="w-full cursor-pointer text-center py-2"
                  onClick={() => setOpen(false)}
                >
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

