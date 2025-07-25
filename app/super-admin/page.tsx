"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Users, Building2, FileText, Settings, BarChart3, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { useAuth } from "@/contexts/AuthContext"

export default function SuperAdminPage() {
  const { user, logout } = useAuth()
  
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
  const [stats] = useState({
    totalUsers: 15420,
    totalContractors: 3250,
    totalCustomers: 12170,
    totalJobs: 8950,
    activeJobs: 2340,
    completedJobs: 6610,
    pendingReviews: 145,
    flaggedContent: 23,
  })

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
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contractors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContractors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
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
              <Badge variant="secondary">{stats.totalCustomers.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Contractors</span>
              <Badge variant="secondary">{stats.totalContractors.toLocaleString()}</Badge>
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
              <Badge variant="default">{stats.completedJobs.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Jobs</span>
              <Badge variant="outline">{stats.activeJobs.toLocaleString()}</Badge>
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
              <span className="text-sm">Pending Reviews</span>
              <Badge variant="destructive">{stats.pendingReviews}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Flagged Content</span>
              <Badge variant="destructive">{stats.flaggedContent}</Badge>
            </div>
            <Link href="/super-admin/content">
              <Button variant="destructive" className="w-full">Review Content</Button>
            </Link>
          </CardContent>
        </Card>


      </div>
    </div>
  )
} 