"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, LogOut, User, Bell, Building2, FileText, Users, CreditCard, Settings, Activity, ShieldCheck, DollarSign, CheckCircle, LifeBuoy, Star, AlertTriangle, Receipt, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { useAdminNotifications } from "@/contexts/AdminNotificationContext"
import { formatDistanceToNow } from "date-fns"
import { Check, Trash2 } from "lucide-react"

// Helper function to check admin permissions
function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

export function AdminNavigationNew() {
  const { admin, logout } = useAdminAuth()
  const { notifications, unreadCount, loading, markAsRead, deleteNotification, fetchNotifications } = useAdminNotifications()
  const pathname = usePathname()
  const router = useRouter()

  if (!admin) return null

  const isSuperAdmin = admin.role === 'SUPER_ADMIN'
  const isMainSuperAdmin = admin.isMainSuperAdmin === true
  const permissions = admin.permissions || []

  // Check permissions for each section
  const canAccessContractors = isSuperAdmin || hasAnyPermission(permissions, ['contractors:read', 'contractors:write'])
  const canAccessJobs = isSuperAdmin || hasAnyPermission(permissions, ['jobs:read', 'jobs:write'])
  const canAccessUsers = isSuperAdmin || hasAnyPermission(permissions, ['users:read', 'users:write'])
  const canAccessFinance = isSuperAdmin || hasAnyPermission(permissions, ['payments:read', 'payments:write'])
  const canAccessContent = isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])
  const canAccessSettings = isSuperAdmin || hasAnyPermission(permissions, ['settings:read', 'settings:write'])
  const canAccessSupport = isSuperAdmin || hasAnyPermission(permissions, ['support:read', 'support:write'])
  const canAccessDisputes = isSuperAdmin || hasAnyPermission(permissions, ['disputes:read', 'disputes:write'])
  const canAccessReviews = isSuperAdmin || hasAnyPermission(permissions, ['reviews:read', 'reviews:write'])
  const canAccessFinalPrice = isSuperAdmin || hasAnyPermission(permissions, ['final_price:read', 'final_price:write'])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-6 flex items-center">
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold hidden md:inline">TrustBuild Admin</span>
          </Link>
        </div>

        {/* Main Navigation - Organized Dropdowns */}
        <nav className="flex items-center space-x-1 text-sm font-medium">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
              pathname === "/admin" ? "bg-accent text-accent-foreground" : "text-foreground/60"
            }`}
          >
            Dashboard
          </Link>

          {/* Contractor Management Dropdown */}
          {canAccessContractors && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto font-medium ${
                    pathname.startsWith("/admin/contractors") || pathname.startsWith("/admin/kyc")
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Contractors
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Contractor Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/contractors" className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    All Contractors
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/kyc" className="cursor-pointer">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    KYC Verification
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Jobs & Projects Dropdown */}
          {canAccessJobs && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto font-medium ${
                    pathname.startsWith("/admin/jobs") || pathname.startsWith("/admin/final-price")
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Jobs
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Job Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/jobs" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    All Jobs
                  </Link>
                </DropdownMenuItem>
                {canAccessFinalPrice && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/final-price-confirmations" className="cursor-pointer">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Final Prices
                    </Link>
                  </DropdownMenuItem>
                )}
                {canAccessReviews && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/reviews" className="cursor-pointer">
                      <Star className="mr-2 h-4 w-4" />
                      Reviews
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Finance Dropdown */}
          {canAccessFinance && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto font-medium ${
                    pathname.startsWith("/admin/payments") || pathname.startsWith("/admin/invoices") || pathname.startsWith("/admin/pricing")
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finance
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Financial Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/payments" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/invoices" className="cursor-pointer">
                    <Receipt className="mr-2 h-4 w-4" />
                    Invoices
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/pricing" className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Pricing
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Support Dropdown - Only show if admin has support or disputes permissions */}
          {(canAccessSupport || canAccessDisputes) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto font-medium ${
                    pathname.startsWith("/admin/disputes") || pathname.startsWith("/admin/support")
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Support
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Support & Help</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canAccessDisputes && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/disputes" className="cursor-pointer">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Disputes
                    </Link>
                  </DropdownMenuItem>
                )}
                {canAccessSupport && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/support" className="cursor-pointer">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      Support Tickets
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`px-3 py-2 h-auto font-medium ${
                  pathname.startsWith("/admin/users") || pathname.startsWith("/admin/content")
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/60"
                }`}
              >
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {canAccessUsers && (
                <>
                  <DropdownMenuLabel>User Management</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      All Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {canAccessContent && (
                <>
                  <DropdownMenuLabel>Content</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/content" className="cursor-pointer">
                      <Folder className="mr-2 h-4 w-4" />
                      Content Manager
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isSuperAdmin && (
                <>
                  <DropdownMenuLabel>Monitoring</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/activity-logs" className="cursor-pointer">
                      <Activity className="mr-2 h-4 w-4" />
                      Activity Logs
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Side - Notifications & User Menu */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Notifications Bell */}
          <DropdownMenu onOpenChange={(open) => {
            // Refresh notifications when dropdown opens
            if (open) {
              fetchNotifications()
            }
          }}>
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
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center">No notifications</span>
                    <span className="text-xs text-muted-foreground mt-1 text-center">You're all caught up!</span>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification, index) => (
                    <div key={notification.id}>
                      <DropdownMenuItem
                        className={`flex-col items-start p-3 cursor-pointer hover:bg-accent ${
                          !notification.isRead ? 'bg-accent/50' : ''
                        }`}
                        onClick={async () => {
                          if (!notification.isRead) {
                            await markAsRead(notification.id)
                          }
                          if (notification.actionLink) {
                            // Use Next.js router for client-side navigation
                            router.push(notification.actionLink)
                          }
                        }}
                      >
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                      {index < notifications.slice(0, 10).length - 1 && <DropdownMenuSeparator />}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/notifications" className="w-full cursor-pointer text-center py-2">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 p-0"
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{admin.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{admin.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {admin.role.replace('_', ' ')}
                    </Badge>
                    {isMainSuperAdmin && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800">
                        Main
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {canAccessSettings && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {isSuperAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings/admins" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          Admin Management
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuGroup>

              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                    Security & Monitoring
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/security/logins" className="cursor-pointer text-xs">
                        Login Activity
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/security/email-activity" className="cursor-pointer text-xs">
                        Email Activity
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/security/error-logs" className="cursor-pointer text-xs">
                        Error Logs
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

