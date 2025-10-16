"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Users, Building2, FileText, Settings, BarChart3, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useAuth } from "@/contexts/AuthContext"
import { adminApi, handleApiError } from "@/lib/api"

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

export default function SuperAdminPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Debug function to test logout
  const handleDebugLogout = async () => {
    console.log("🔴 Super Admin Debug Logout - Starting...")
    console.log("🔴 Current user:", user)
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
      handleApiError(error, 'Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

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
              <h1 className="text-3xl font-bold">Super Admin Panel</h1>
            </div>
            <p className="text-muted-foreground">
              Manage the entire TrustBuild platform with advanced administrative controls
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
            <CardTitle className="text-sm font-medium">Contractors</CardTitle>
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
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.jobs?.active?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs?.active || 0} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage all users, contractors, and customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Customers</span>
              <Badge variant="secondary">{stats?.customers?.total?.toLocaleString() || '0'}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Contractors</span>
              <Badge variant="secondary">{stats?.contractors?.total?.toLocaleString() || '0'}</Badge>
            </div>
            <Link href="/super-admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Management
            </CardTitle>
            <CardDescription>
              Monitor and manage all platform jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed Jobs</span>
              <Badge variant="default">{stats?.jobs?.completed?.toLocaleString() || '0'}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Jobs</span>
              <Badge variant="outline">{stats?.jobs?.active?.toLocaleString() || '0'}</Badge>
            </div>
            <Link href="/super-admin/jobs">
              <Button className="w-full">Manage Jobs</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Content Moderation
            </CardTitle>
            <CardDescription>
              Review flagged content and pending approvals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Reviews</span>
              <Badge variant="secondary">{stats?.reviews?.total || '0'}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Flagged Reviews</span>
              <Badge variant="destructive">{stats?.reviews?.flagged || '0'}</Badge>
            </div>
            <Link href="/super-admin/content">
              <Button variant="destructive" className="w-full">Review Content</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Management
            </CardTitle>
            <CardDescription>
              Create and manage admin users with permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Admin Users</span>
              <Badge variant="secondary">Manage</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Permission Control</span>
              <Badge variant="outline">Granular</Badge>
            </div>
            <Link href="/super-admin/admins">
              <Button className="w-full">Manage Admins</Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
} 