"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Star, Building2, MessageSquare, AlertCircle, Calendar, CheckCircle, DollarSign, MapPin, Plus, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { customersApi, jobsApi, reviewsApi, handleApiError, Customer, Job, Review } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'


export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
    averageJobBudget: 0,
    totalReviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch data if user is authenticated and not loading
    if (!authLoading && user) {
      fetchDashboardData()
    } else if (!authLoading && !user) {
      // If not authenticated, stop loading
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch customer profile and dashboard data
      const dashboardData = await customersApi.getDashboard()
      
      setCustomer(dashboardData.customer || null)
      setActiveJobs(Array.isArray(dashboardData.activeJobs) ? dashboardData.activeJobs : [])
      setStats(dashboardData.stats || {
        totalJobs: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalSpent: 0,
        averageJobBudget: 0,
        totalReviews: 0
      })
      setRecentReviews(Array.isArray(dashboardData.recentReviews) ? dashboardData.recentReviews : [])

      // Fetch posted jobs - with error handling
      try {
        const postedJobs = await jobsApi.getMyPostedJobs()
        const completedJobsData = Array.isArray(postedJobs) ? postedJobs.filter(job => job.status === 'COMPLETED') : []
        setCompletedJobs(Array.isArray(completedJobsData) ? completedJobsData : [])
      } catch (error) {
        console.log('Posted jobs API not available yet, using empty array')
        setCompletedJobs([])
      }

    } catch (error) {
      handleApiError(error, 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Quote on request'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobProgress = (job: Job) => {
    if (job.status === 'COMPLETED') return 100
    if (job.status === 'IN_PROGRESS') return 65 // Could be calculated based on milestones
    if (job.status === 'POSTED') return 0
    return 0
  }

  if (loading) {
  return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {customer?.user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your projects and find trusted contractors
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/post-job">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Link>
          </Button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Projects posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats.averageJobBudget)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your next project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-20 flex-col">
                <Link href="/post-job">
                  <Plus className="h-6 w-6 mb-2" />
                  Post New Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/profile">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>
                  Projects currently in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active projects</p>
                    <Button asChild className="mt-4">
                      <Link href="/post-job">Post Your First Job</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {job.location} • {formatCurrency(job.budget)}
                        </p>
                        {job.status === 'IN_PROGRESS' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{getJobProgress(job)}%</span>
                            </div>
                            <Progress value={getJobProgress(job)} className="h-2" />
                          </div>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/client/jobs/${job.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/client/current-jobs">View All Active</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Completed Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Completions</CardTitle>
                <CardDescription>
                  Recently finished projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed projects yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getStatusColor(job.status)}>
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.location} • {formatCurrency(job.budget)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Completed: {job.completionDate ? new Date(job.completionDate).toLocaleDateString() : 'Recently'}
                          </span>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/client/jobs/${job.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/client/job-history">View All Completed</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Reviews you've left for contractors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <div className="text-center py-6">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete projects to leave reviews for contractors
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {review.contractor.businessName || review.contractor.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-medium mb-2">{review.job?.title || review.projectType || 'External Project'}</h4>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          &quot;{review.comment}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/client/reviews">View All Reviews</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                Monitor progress of your ongoing projects
              </CardDescription>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active projects</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your next project by posting a job
                  </p>
                  <Button asChild>
                    <Link href="/post-job">Post a Job</Link>
                  </Button>
              </div>
            ) : (
                <div className="space-y-4">
                {activeJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{job.title}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Budget: {formatCurrency(job.budget)}
                        </div>
                            <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                            </div>

                      {job.status === 'IN_PROGRESS' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{getJobProgress(job)}%</span>
                          </div>
                          <Progress value={getJobProgress(job)} className="h-2" />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/client/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                        {job.applications && job.applications.length > 0 && (
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/client/jobs/${job.id}/applications`}>
                              {job.applications.length} Applications
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="completed">
        <Card>
          <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>
                Your successfully finished projects
              </CardDescription>
          </CardHeader>
          <CardContent>
            {completedJobs.length === 0 ? (
              <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed projects yet</h3>
                  <p className="text-muted-foreground">
                    Completed projects will appear here
                  </p>
              </div>
            ) : (
                <div className="space-y-4">
                {completedJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{job.title}</h4>
                        <Badge className={getStatusColor(job.status)}>
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Budget: {formatCurrency(job.budget)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Completed: {job.completionDate ? new Date(job.completionDate).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/client/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                        {job.reviews && job.reviews.length === 0 && (
                          <Button asChild size="sm">
                            <Link href={`/dashboard/client/jobs/${job.id}/review`}>
                              Leave Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
                  </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>
                Reviews you've left for contractors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Complete projects to leave reviews for contractors
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">
                            {review.contractor.businessName || review.contractor.user.name}
                          </span>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="font-medium mb-2">{review.job?.title || review.projectType || 'External Project'}</h4>
                      
                      {review.comment && (
                        <p className="text-muted-foreground">
                          &quot;{review.comment}&quot;
                        </p>
                      )}
                    </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}