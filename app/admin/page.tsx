"use client"

import { useState } from "react"
import { Shield, Users, Building2, FileText, Settings, BarChart3, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdminPage() {
  const [stats] = useState({
    totalContractors: 3250,
    verifiedContractors: 2840,
    pendingApprovals: 45,
    totalJobs: 8950,
    activeJobs: 2340,
    completedJobs: 6610,
    totalReviews: 12450,
    pendingReviews: 89,
  })

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage contractors, jobs, and reviews on the TrustBuild platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContractors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Contractors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedContractors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">87% of total</p>
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
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+22% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <Badge variant="default">{stats.verifiedContractors.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Approvals</span>
              <Badge variant="destructive">{stats.pendingApprovals}</Badge>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/contractors">Manage Contractors</Link>
            </Button>
          </CardContent>
        </Card>

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
              <Badge variant="outline">{stats.activeJobs.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed Jobs</span>
              <Badge variant="secondary">{stats.completedJobs.toLocaleString()}</Badge>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/jobs">View Jobs</Link>
            </Button>
          </CardContent>
        </Card>

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
              <Badge variant="secondary">{stats.totalReviews.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending Reviews</span>
              <Badge variant="destructive">{stats.pendingReviews}</Badge>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/reviews">Moderate Reviews</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Platform Analytics
            </CardTitle>
            <CardDescription>
              View platform performance and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/analytics/contractor-stats">Contractor Stats</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/analytics/job-reports">Job Reports</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/analytics/review-analytics">Review Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Support
            </CardTitle>
            <CardDescription>
              Handle customer inquiries and complaints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Open Tickets</span>
              <Badge variant="outline">23</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Resolved Today</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/support">Support Center</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Content Management
            </CardTitle>
            <CardDescription>
              Manage platform content and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/content/featured-contractors">Featured Contractors</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/content/platform-content">Platform Content</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/content/faq">FAQ Management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">New contractor application</p>
                <p className="text-xs text-muted-foreground">Elite Home Solutions - Kitchen Specialists</p>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Disputed job reported</p>
                <p className="text-xs text-muted-foreground">Job #12345 - Bathroom renovation dispute</p>
              </div>
              <Button size="sm" variant="outline">Investigate</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Review flagged for moderation</p>
                <p className="text-xs text-muted-foreground">Potentially inappropriate content detected</p>
              </div>
              <Button size="sm" variant="outline">Moderate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 