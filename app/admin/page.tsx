"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Building2, FileText, CreditCard, Star, RefreshCw, Settings, CheckCircle, Lock } from "lucide-react"
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
  const { admin, logout } = useAdminAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SUPER_ADMIN has all permissions by default
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const permissions = admin?.permissions || []
  
  // Debug function to test logout
  const handleDebugLogout = async () => {
    console.log("🔴 Admin Debug Logout - Starting...")
    console.log("🔴 Current admin:", admin)
    console.log("🔴 Admin role:", admin?.role)
    try {
      await logout()
      console.log("🔴 Logout successful")
    } catch (error) {
      console.error("🔴 Logout error:", error)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const dashboardData = await adminApi.getDashboardStats()
      setStats(dashboardData)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (admin) {
      fetchDashboardStats()
    }
  }, [admin])

  if (loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
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
          <Button 
            variant="outline" 
            onClick={handleDebugLogout}
            className="bg-orange-50 text-orange-600 hover:bg-orange-100"
          >
            🔍 Debug Logout
          </Button>
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
        {(isSuperAdmin || hasAnyPermission(permissions, ['contractors:read', 'contractors:write', 'contractors:approve'])) && (
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
        {(isSuperAdmin || hasAnyPermission(permissions, ['jobs:read', 'jobs:write', 'jobs:delete'])) && (
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
        {(isSuperAdmin || hasAnyPermission(permissions, ['reviews:read', 'reviews:write', 'reviews:delete'])) && (
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
        {(isSuperAdmin || hasAnyPermission(permissions, ['users:read', 'users:write', 'users:delete'])) && (
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

        {/* Payment Management - requires payments:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['payments:read', 'payments:write', 'payments:refund', 'content:read', 'content:write'])) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Content
              </CardTitle>
              <CardDescription>
                Manage payments and content moderation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(isSuperAdmin || hasAnyPermission(permissions, ['payments:read', 'payments:write', 'payments:refund'])) && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/payments">Payment Dashboard</Link>
                </Button>
              )}
              {(isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])) && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/content">Content Moderation</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Platform Settings - requires settings:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['settings:read', 'settings:write', 'pricing:read', 'pricing:write'])) && (
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
                <Badge variant="outline">5%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Subscription Plans</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/settings">Manage Settings</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KYC Review - requires kyc:read */}
        {(isSuperAdmin || hasAnyPermission(permissions, ['kyc:read', 'kyc:write', 'kyc:approve'])) && (
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

        {/* Security & Logs - SUPER_ADMIN only */}
        {admin?.role === 'SUPER_ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security & Logs
              </CardTitle>
              <CardDescription>
                Monitor admin activity and login attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Login Activities</span>
                <Badge variant="outline">View</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Activity Logs</span>
                <Badge variant="outline">View</Badge>
              </div>
              <Button className="w-full" asChild>
                <Link href="/admin/security/logins">View Logs</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 