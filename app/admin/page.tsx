"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, Building2, FileText, CreditCard, Star, RefreshCw, Settings, CheckCircle, Lock, MessageSquare, Receipt, DollarSign, AlertTriangle, Activity, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { useAdminAuth } from "@/contexts/AdminAuthContext"
import adminApi from "@/lib/adminApi"
import { useToast } from "@/hooks/use-toast"

// Helper function to check admin permissions
function hasPermission(userPermissions: string[] | null | undefined, required: string): boolean {
  // SUPER_ADMIN has all permissions
  if (!userPermissions) return false;
  return userPermissions.includes(required);
}

function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false;
  return required.some(perm => userPermissions.includes(perm));
}

interface DashboardStats {
  users: { total: number; active: number; inactive: number };
  contractors: { total: number; approved: number; pending: number };
  customers: { total: number };
  jobs: { total: number; active: number; completed: number };
  reviews: { total: number; flagged: number };
  applications: { total: number; pending: number };
  services: { total: number; active: number };
  revenue: { total: number };
  recent: { users: any[]; jobs: any[] };
}

export default function AdminPage() {
  const { admin, logout, loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [commissionRate, setCommissionRate] = useState<number | null>(null)
  const [subscriptionPricing, setSubscriptionPricing] = useState<any>(null)
  
  // Redirect to login if not authenticated (only after auth check is complete)
  useEffect(() => {
    // Don't redirect while still loading auth state
    if (authLoading) return
    
    // Only redirect if we're sure there's no admin and no token
    if (!admin && !localStorage.getItem('admin_token')) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])
  
  // SUPER_ADMIN has all permissions by default
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const permissions = admin?.permissions || []
  

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      const dashboardData = await adminApi.getDashboardStats()
      setStats(dashboardData)
      
      // Fetch settings for Platform Settings card
      try {
        const [rate, pricing] = await Promise.all([
          adminApi.getCommissionRate(),
          adminApi.getSubscriptionPricing(),
        ])
        setCommissionRate(rate)
        setSubscriptionPricing(pricing)
      } catch (settingsError) {
        console.error('Failed to fetch settings:', settingsError)
        // Use defaults if fetch fails
        setCommissionRate(5.0)
        setSubscriptionPricing({
          monthly: 49.99,
          sixMonths: 269.94,
          yearly: 479.88,
          currency: 'GBP',
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    console.log('📊 Dashboard: useEffect triggered', { admin: !!admin, authLoading })
    if (admin) {
      console.log('📊 Dashboard: Admin exists, fetching stats')
      fetchDashboardStats()
    } else {
      console.log('📊 Dashboard: No admin yet')
    }
  }, [admin, fetchDashboardStats, authLoading])

  // Show loading while checking authentication OR if we have a token but no admin yet
  if (authLoading || (loading && localStorage.getItem('admin_token'))) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (but only if auth check is complete)
  if (!admin && !authLoading) {
    return null
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Manage contractors, jobs, and reviews on the TrustBuild platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw 
              className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary transition-colors" 
              onClick={fetchDashboardStats}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.contractors?.total?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.contractors?.approved || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.users?.total?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.users?.active || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.jobs?.total?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs?.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.reviews?.total?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.reviews?.flagged || 0} flagged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contractor Management - requires contractors:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['contractors:read', 'contractors:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Contractor Management
              </CardTitle>
              <CardDescription>
                Verify and manage contractor profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Verified Contractors</span>
                <Badge variant="default">
                  {stats?.contractors?.approved?.toLocaleString() || '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Approvals</span>
                <Badge variant="destructive">
                  {stats?.contractors?.pending || '0'}
                </Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/contractors">Manage Contractors</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Job Oversight - requires jobs:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['jobs:read', 'jobs:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Oversight
              </CardTitle>
              <CardDescription>
                Monitor job quality and resolve disputes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Jobs</span>
                <Badge variant="outline">
                  {stats?.jobs?.active?.toLocaleString() || '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Jobs</span>
                <Badge variant="secondary">
                  {stats?.jobs?.completed?.toLocaleString() || '0'}
                </Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/jobs">View Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Review Management - requires reviews:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['reviews:read', 'reviews:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Review Management
              </CardTitle>
              <CardDescription>
                Moderate reviews and handle reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Reviews</span>
                <Badge variant="secondary">
                  {stats?.reviews?.total?.toLocaleString() || '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Flagged Reviews</span>
                <Badge variant="destructive">
                  {stats?.reviews?.flagged || '0'}
                </Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/reviews">Moderate Reviews</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* User Management - requires users:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['users:read', 'users:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage platform users and accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users</span>
                <Badge variant="secondary">
                  {stats?.users?.total?.toLocaleString() || '0'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users</span>
                <Badge variant="default">
                  {stats?.users?.active?.toLocaleString() || '0'}
                </Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content Moderation - SUPPORT_ADMIN access */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>
                Manage FAQs, featured contractors, and flagged content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/content/faq">Manage FAQs</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/content/featured-contractors">Featured Contractors</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/content/flagged">Flagged Content</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Management - FINANCE_ADMIN access */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['payments:read', 'payments:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Dashboard
              </CardTitle>
              <CardDescription>
                Manage payments, refunds, and financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Revenue</span>
                <Badge variant="default">
                  £{stats?.revenue?.total?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/payments">Payment Dashboard</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/payments?tab=subscriptions">Subscriptions</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Platform Settings - FINANCE_ADMIN access */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['settings:read', 'settings:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>
                Configure commission rates and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Commission Rate</span>
                <Badge variant="outline">
                  {commissionRate !== null ? `${commissionRate}%` : 'Loading...'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Subscription Plans</span>
                <Badge variant="outline">
                  {subscriptionPricing ? 'Active' : 'Loading...'}
                </Badge>
              </div>
              {subscriptionPricing && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Monthly: £{subscriptionPricing.monthly}</div>
                  <div>6-Month: £{subscriptionPricing.sixMonths}</div>
                  <div>Yearly: £{subscriptionPricing.yearly}</div>
                </div>
              )}
              <Button className="w-full" asChild>
                <Link href="/admin/settings">Manage Settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KYC Review - requires kyc:read (both SUPPORT and FINANCE can review, only FINANCE can approve) */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['kyc:read', 'kyc:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                KYC Review
              </CardTitle>
              <CardDescription>
                Review contractor identity verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Review</span>
                <Badge variant="destructive">Check</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Approved</span>
                <Badge variant="default">View</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/kyc">Review KYC</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Support Tickets - SUPPORT_ADMIN access */}
        {(isSuperAdmin || admin?.role === 'SUPPORT_ADMIN' || hasAnyPermission(permissions, ['support:read', 'support:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Support
              </CardTitle>
              <CardDescription>
                Manage customer inquiries and support tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Open Tickets</span>
                <Badge variant="destructive">View</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline">View</Badge>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" asChild>
                  <Link href="/admin/support/chat">Chat</Link>
                </Button>
                <Button className="flex-1" variant="outline" asChild>
                  <Link href="/admin/support/broadcast">Broadcast</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/admin/support">Tickets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoices Management - FINANCE_ADMIN access */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['payments:read', 'payments:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoices Management
              </CardTitle>
              <CardDescription>
                View and manage all invoices in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">All Invoices</span>
                <Badge variant="outline">View</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Manual Invoices</span>
                <Badge variant="outline">Create</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/invoices">Manage Invoices</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pricing & Credits - FINANCE_ADMIN access */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['pricing:read', 'pricing:write', 'contractors:read', 'contractors:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Credits
              </CardTitle>
              <CardDescription>
                Manage service pricing and contractor credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Service Pricing</span>
                <Badge variant="outline">Configure</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Credit Management</span>
                <Badge variant="outline">Manage</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/pricing">Manage Pricing</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Disputes Management - requires disputes:read (both SUPPORT and FINANCE can manage disputes) */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['disputes:read', 'disputes:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disputes Management
              </CardTitle>
              <CardDescription>
                Review and resolve customer/contractor disputes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Open Disputes</span>
                <Badge variant="destructive">View</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolved</span>
                <Badge variant="default">View</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/disputes">Manage Disputes</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Admin Notifications - available to all admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Admin Notifications
            </CardTitle>
            <CardDescription>
              View system events and important admin actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Unread Notifications</span>
              <Badge variant="destructive">View</Badge>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/notifications">View Notifications</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Security & Activity Logs - SUPER_ADMIN only */}
        {admin?.role === 'SUPER_ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor system activity, security events, and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/activity-logs">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity Logs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/security/logins">
                  <Lock className="h-4 w-4 mr-2" />
                  Login Activities
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/security/email-activity">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Email Activity
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/security/error-logs">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Error Logs
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 