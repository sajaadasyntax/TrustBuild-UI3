"use client"

import { BarChart3, TrendingUp, Users, Award, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ContractorStatsPage() {
  const contractorData = {
    totalContractors: 3250,
    newThisMonth: 185,
    topRated: 89,
    activeContractors: 2840,
    suspendedContractors: 125,
    pendingVerification: 45,
  }

  const topPerformers = [
    { name: "Smith & Sons Builders", rating: 4.9, completedJobs: 156, revenue: "£89,500" },
    { name: "Modern Interiors Ltd", rating: 4.8, completedJobs: 143, revenue: "£76,200" },
    { name: "Elite Construction Co", rating: 4.8, completedJobs: 134, revenue: "£92,100" },
    { name: "Premium Home Solutions", rating: 4.7, completedJobs: 128, revenue: "£71,800" },
    { name: "Expert Renovations", rating: 4.7, completedJobs: 122, revenue: "£68,900" },
  ]

  const categoryStats = [
    { category: "Kitchen Renovation", contractors: 450, avgRating: 4.6 },
    { category: "Bathroom Remodeling", contractors: 380, avgRating: 4.5 },
    { category: "General Construction", contractors: 520, avgRating: 4.4 },
    { category: "Electrical Work", contractors: 290, avgRating: 4.7 },
    { category: "Plumbing", contractors: 310, avgRating: 4.5 },
    { category: "Roofing", contractors: 180, avgRating: 4.3 },
  ]

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Contractor Statistics</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive analytics and performance metrics for contractors
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contractorData.totalContractors.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Contractors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {contractorData.activeContractors.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {contractorData.newThisMonth}
            </div>
            <p className="text-sm text-muted-foreground">New This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contractorData.topRated}
            </div>
            <p className="text-sm text-muted-foreground">Top Rated (4.8+)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {contractorData.pendingVerification}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {contractorData.suspendedContractors}
            </div>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Contractors
            </CardTitle>
            <CardDescription>Based on ratings and completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((contractor, index) => (
                <div key={contractor.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{contractor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ⭐ {contractor.rating} • {contractor.completedJobs} jobs
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{contractor.revenue}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contractors by Category
            </CardTitle>
            <CardDescription>Distribution across service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg Rating: ⭐ {category.avgRating}
                    </p>
                  </div>
                  <Badge variant="outline">{category.contractors} contractors</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Growth Trends
          </CardTitle>
          <CardDescription>Contractor registration and activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">+15%</div>
              <p className="text-sm text-muted-foreground">New Registrations</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">+8%</div>
              <p className="text-sm text-muted-foreground">Active Contractors</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">+12%</div>
              <p className="text-sm text-muted-foreground">Job Completions</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">4.6</div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 