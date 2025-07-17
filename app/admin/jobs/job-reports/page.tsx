"use client"

import { FileText, Calendar, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function JobReportsPage() {
  const jobStats = {
    totalJobs: 8950,
    completedJobs: 6610,
    inProgressJobs: 2340,
    openJobs: 850,
    disputedJobs: 23,
    cancelledJobs: 127,
    averageValue: 4200,
    totalValue: 37600000,
  }

  const monthlyData = [
    { month: "Jan", jobs: 745, value: 3120000, completionRate: 93 },
    { month: "Feb", jobs: 682, value: 2890000, completionRate: 94 },
    { month: "Mar", jobs: 798, value: 3350000, completionRate: 91 },
    { month: "Apr", jobs: 856, value: 3590000, completionRate: 92 },
    { month: "May", jobs: 923, value: 3880000, completionRate: 89 },
    { month: "Jun", jobs: 1045, value: 4390000, completionRate: 88 },
  ]

  const categoryBreakdown = [
    { category: "Kitchen Renovation", jobs: 1890, avgValue: 5200, completionRate: 94 },
    { category: "Bathroom Remodeling", jobs: 1650, avgValue: 3800, completionRate: 92 },
    { category: "General Construction", jobs: 1420, avgValue: 6800, completionRate: 88 },
    { category: "Electrical Work", jobs: 980, avgValue: 2400, completionRate: 96 },
    { category: "Plumbing", jobs: 850, avgValue: 1800, completionRate: 95 },
    { category: "Roofing", jobs: 720, avgValue: 4500, completionRate: 90 },
  ]

  const topJobsByValue = [
    { title: "Luxury Home Extension", value: 85000, contractor: "Elite Construction Co", status: "completed" },
    { title: "Complete House Renovation", value: 72000, contractor: "Premium Home Solutions", status: "in_progress" },
    { title: "Commercial Kitchen Fit-out", value: 68000, contractor: "Commercial Specialists Ltd", status: "completed" },
    { title: "Master Bathroom Suite", value: 45000, contractor: "Luxury Interiors", status: "completed" },
    { title: "Home Office Extension", value: 38000, contractor: "Modern Builders", status: "in_progress" },
  ]

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Job Reports</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for job performance across the platform
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {jobStats.totalJobs.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {jobStats.completedJobs.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {jobStats.inProgressJobs.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              £{jobStats.averageValue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Average Value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Job volume and completion rates by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {month.month}
                    </div>
                    <div>
                      <p className="font-medium">{month.jobs} jobs</p>
                      <p className="text-sm text-muted-foreground">
                        £{(month.value / 1000000).toFixed(1)}M value
                      </p>
                    </div>
                  </div>
                  <Badge variant={month.completionRate >= 90 ? "default" : "secondary"}>
                    {month.completionRate}% complete
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Jobs by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Highest Value Jobs
            </CardTitle>
            <CardDescription>Top jobs by project value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJobsByValue.map((job, index) => (
                <div key={job.title} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.contractor}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">£{job.value.toLocaleString()}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {job.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Jobs by Category
          </CardTitle>
          <CardDescription>Performance metrics across different job categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.map((category) => (
              <div key={category.category} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{category.category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jobs</span>
                    <span className="font-medium">{category.jobs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Value</span>
                    <span className="font-medium">£{category.avgValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <Badge variant={category.completionRate >= 90 ? "default" : "secondary"}>
                      {category.completionRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Key Performance Metrics
          </CardTitle>
          <CardDescription>Overall platform performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">91%</div>
              <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4.6</div>
              <p className="text-sm text-muted-foreground">Average Customer Rating</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">£37.6M</div>
              <p className="text-sm text-muted-foreground">Total Platform Value</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">18 days</div>
              <p className="text-sm text-muted-foreground">Average Job Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 