"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle, ArrowRight, Bell, BriefcaseBusiness, Clock, CreditCard, FileCheck, 
  FileClock, FileText, Star, TrendingUp, Wallet, Briefcase, MapPin, DollarSign, Calendar, CheckCircle, Eye
} from "lucide-react"
import { contractorsApi, jobsApi, reviewsApi, handleApiError, Contractor, Job, JobApplication, Review } from '@/lib/api'

import { useAuth } from '@/contexts/AuthContext'

export default function ContractorDashboard() {
  const { logout } = useAuth()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch contractor profile
      const contractorData = await contractorsApi.getMyProfile()
      setContractor(contractorData)

      // Fetch job applications
      const applicationsData = await jobsApi.getMyApplications()
      setApplications(applicationsData)

      // Fetch jobs (active and completed) from accepted applications
      const acceptedApplications = applicationsData.filter(app => app.status === 'ACCEPTED')
      const jobsFromApplications = acceptedApplications.map(app => app.job)
      const activeJobsData = jobsFromApplications.filter(job => job.status === 'IN_PROGRESS')
      const completedJobsData = jobsFromApplications.filter(job => job.status === 'COMPLETED')
      
      setActiveJobs(activeJobsData)
      setCompletedJobs(completedJobsData)

      // Fetch recent reviews
      const reviewsData = await reviewsApi.getMyReceived()
      setRecentReviews(reviewsData.slice(0, 5)) // Get latest 5 reviews

      // Calculate stats
      setStats({
        totalApplications: applicationsData.length,
        activeJobs: activeJobsData.length,
        completedJobs: completedJobsData.length,
        totalEarnings: completedJobsData.reduce((sum, job) => sum + (job.budget || 0), 0),
        averageRating: contractorData.averageRating || 0,
        totalReviews: contractorData.reviewCount || 0
      })

    } catch (error) {
      handleApiError(error, 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and find new opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/contractor/current-jobs">
              <Clock className="mr-2 h-4 w-4" />
              Current Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/contractor/job-history">
              <FileCheck className="mr-2 h-4 w-4" />
              Job History
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              Find Jobs
            </Link>
          </Button>

        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-6 mb-8">
        <div className="md:w-2/3 space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Active</AlertTitle>
            <AlertDescription>
              Your monthly subscription is active. Next billing date: {contractor?.subscription?.nextBillingDate || 'Not available'}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Earnings</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatCurrency(stats.totalEarnings)}</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
                <div className="flex items-center mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Free Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{contractor?.subscription?.freeApplicationsLeft || 0}</div>
                <p className="text-sm text-muted-foreground">Remaining this week</p>
                <div className="flex items-center mt-2 text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  <span>Resets on Sunday</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">98%</div>
                <p className="text-sm text-muted-foreground">From 14 total projects</p>
                <div className="flex items-center mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>3% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Profile</CardTitle>
              <CardDescription>
                {contractor?.businessName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">PC</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                    Premium
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent" />
                    <span className="ml-1 font-medium">4.9</span>
                    <span className="mx-1 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">48 reviews</span>
                  </div>
                  <p className="text-sm mt-1">Kitchen Remodeling Specialist</p>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/profile">
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Your latest job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-6">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No applications yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{application.job.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(application.proposedRate)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.toLowerCase()}
                        </Badge>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/contractor/applications">View All</Link>
                </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                  <CardDescription>
                  Jobs you're currently working on
                  </CardDescription>
                </CardHeader>
                <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active jobs</p>
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
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.location} • {job.budget ? formatCurrency(job.budget) : 'Quote on request'}
                        </p>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/contractor/jobs/${job.id}`}>
                            View Details
                    </Link>
                  </Button>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/contractor/current-jobs">View All</Link>
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
                Latest feedback from your clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
              {recentReviews.length === 0 ? (
                <div className="text-center py-6">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
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
                            {review.customer.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                  </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/contractor/reviews">View All Reviews</Link>
                  </Button>
                  </div>
              )}
                </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>
                Track the status of all your job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start applying to jobs to grow your business
                  </p>
                  <Button asChild>
                    <Link href="/jobs">Browse Available Jobs</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{application.job.title}</h4>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.toLowerCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.job.location}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Proposed: {formatCurrency(application.proposedRate)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {application.coverLetter && (
                        <p className="text-sm mb-3 text-muted-foreground">
                          "{application.coverLetter.substring(0, 150)}..."
                        </p>
                      )}

                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/jobs/${application.job.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Job
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
              </Card>
        </TabsContent>
        
        <TabsContent value="jobs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>
                  Jobs currently in progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active jobs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-1">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.location} • {job.budget ? formatCurrency(job.budget) : 'Quote on request'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
                <CardDescription>
                  Successfully finished projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedJobs.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed jobs yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-1">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.location} • {job.budget ? formatCurrency(job.budget) : 'Quote on request'}
                        </p>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                Feedback from your clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
              {recentReviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Complete jobs to start receiving reviews from customers
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
                            {review.customer.user.name}
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
                      
                      <h4 className="font-medium mb-2">{review.job.title}</h4>
                      
                      {review.comment && (
                        <p className="text-muted-foreground">
                          "{review.comment}"
                        </p>
                      )}
                  </div>
                  ))}
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/contractor/reviews">View All Reviews</Link>
                  </Button>
                </div>
              )}
            </CardContent>
              </Card>
        </TabsContent>
      </Tabs>

      
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-medium">Professional Plan</h3>
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
              </div>
              <Badge variant={contractor?.subscription?.status === "ACTIVE" ? "outline" : "destructive"}>
                {contractor?.subscription?.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{contractor?.subscription?.amount ? formatCurrency(contractor.subscription.amount) : 'N/A'}/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-medium">{contractor?.subscription?.nextBillingDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="font-medium">Direct Debit</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Update Payment Method</Button>
            <Button variant="outline">Manage Subscription</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}