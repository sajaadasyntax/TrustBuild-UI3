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
  FileClock, FileText, Star, TrendingUp, Wallet, Briefcase, MapPin, DollarSign, Calendar, CheckCircle, Eye, Shield
} from "lucide-react"
import { contractorsApi, jobsApi, reviewsApi, paymentsApi, handleApiError, Contractor, Job, JobApplication, Review } from '@/lib/api'
import { CommissionExplanation } from '@/components/subscription/CommissionExplanation'
import { KycStatusBanner } from '@/components/auth/KycStatusBanner'

import { useAuth } from '@/contexts/AuthContext'

export default function ContractorDashboard() {
  const { logout } = useAuth()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [creditInfo, setCreditInfo] = useState<{
    creditsBalance: number;
    weeklyCreditsLimit: number;
    nextCreditReset: string;
  } | null>(null)
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    earningsGrowth: 0
  })

  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [pendingCommissions, setPendingCommissions] = useState<any[]>([])
  const [commissionLoading, setCommissionLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchSubscriptionData()
    fetchPendingCommissions()
  }, [])

  const fetchPendingCommissions = async () => {
    try {
      setCommissionLoading(true)
      const response = await paymentsApi.getCommissionPayments({ status: 'PENDING', page: 1, limit: 10 })
      // Handle different response structures
      const commissions = response.data?.commissions || response.commissions || []
      setPendingCommissions(commissions.filter((comm: any) => comm.status === 'PENDING' || comm.status === 'OVERDUE'))
    } catch (error) {
      console.error('Failed to fetch pending commissions:', error)
    } finally {
      setCommissionLoading(false)
    }
  }

  const fetchSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true)
      const { hasSubscription, subscription } = await paymentsApi.getSubscriptionStatus()
      setSubscription(subscription || null)
    } catch (error) {
      handleApiError(error, 'Failed to fetch subscription data')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch contractor profile
      const contractorData = await contractorsApi.getMyProfile()
      setContractor(contractorData)

      // Fetch current credit information
      try {
        const earningsData = await contractorsApi.getMyEarnings()
        setCreditInfo({
          creditsBalance: earningsData.creditsBalance,
          weeklyCreditsLimit: earningsData.weeklyCreditsLimit,
          nextCreditReset: earningsData.nextCreditReset
        })
      } catch (error) {
        console.warn('Failed to fetch credit info:', error)
      }

      // Fetch job applications
      const applicationsData = await jobsApi.getMyApplications()
      setApplications(applicationsData)

      // Fetch jobs (active and completed) from accepted applications and won jobs
      const acceptedApplications = applicationsData.filter(app => app.status === 'ACCEPTED')
      const jobsFromApplications = acceptedApplications.map(app => app.job)
      
      // Also get jobs where contractor won (wonByContractorId)
      // Note: This should be fetched from the backend, but for now we'll use applications
      const activeJobsData = jobsFromApplications.filter(job => ['IN_PROGRESS', 'WON', 'DISPUTED'].includes(job.status))
      const completedJobsData = jobsFromApplications.filter(job => job.status === 'COMPLETED')
      
      setActiveJobs(activeJobsData)
      setCompletedJobs(completedJobsData)

      // Fetch recent reviews
      const reviewsData = await reviewsApi.getMyReceived()
      setRecentReviews(reviewsData.slice(0, 5)) // Get latest 5 reviews

      // Calculate stats using actual earnings data
      const earningsData = await contractorsApi.getMyEarnings()
      setStats({
        totalApplications: applicationsData.length,
        activeJobs: activeJobsData.length,
        completedJobs: completedJobsData.length,
        totalEarnings: earningsData.totalEarnings,
        monthlyEarnings: earningsData.monthlyEarnings,
        averageRating: contractorData.averageRating || 0,
        totalReviews: contractorData.reviewCount || 0,
        earningsGrowth: (() => {
          const previousEarnings = earningsData.totalEarnings - earningsData.monthlyEarnings;
          if (previousEarnings > 0 && earningsData.monthlyEarnings > 0) {
            return Math.round(((earningsData.monthlyEarnings - previousEarnings) / previousEarnings) * 100);
          }
          return 0;
        })()
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

  // Helper to format location based on access level
  const formatLocationForApplication = (job: any) => {
    // For applications, contractor may not have purchased access yet
    // Only show postcode area unless they have confirmed access
    return job.postcode ? `${job.postcode} area` : 'Area details available after purchase'
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

  const getNextResetDate = () => {
    if (!creditInfo?.nextCreditReset) return 'weekly'
    
    const resetDate = new Date(creditInfo.nextCreditReset)
    const now = new Date()
    const daysLeft = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 0) return 'Reset available now'
    if (daysLeft === 1) return 'Tomorrow'
    return `In ${daysLeft} days`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
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
    <div className="container px-4 py-6 md:py-12 lg:py-16 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and find new opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/kyc">
              <Shield className="mr-2 h-4 w-4" />
              KYC Verification
            </Link>
          </Button>
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
          <Button variant="outline" asChild>
            <Link href="/dashboard/contractor/disputes">
              <AlertCircle className="mr-2 h-4 w-4" />
              My Disputes
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

      {/* KYC Status Banner */}
      <KycStatusBanner />

      {/* Commission Reminder Banner - Always visible if there are pending commissions */}
      {pendingCommissions.length > 0 && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Commission Payment Due</AlertTitle>
          <AlertDescription className="text-orange-700">
            You have {pendingCommissions.length} pending commission payment{pendingCommissions.length > 1 ? 's' : ''} totaling{' '}
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP'
            }).format(
              pendingCommissions.reduce((sum, comm) => sum + (Number(comm.totalAmount) || 0), 0)
            )}
            .{' '}
            <Link href="/dashboard/contractor/commissions" className="font-semibold underline">
              View and pay now
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse md:flex-row gap-6 mb-8">
        <div className="md:w-2/3 space-y-6">
          {subscription && subscription.status === 'active' ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Active</AlertTitle>
              <AlertDescription>
                Your {subscription.plan || 'monthly'} subscription is active. Next billing date: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'Not available'}
              </AlertDescription>
            </Alert>
          ) : subscription && subscription.status !== 'active' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Subscription Inactive</AlertTitle>
              <AlertDescription>
                Your subscription is {subscription.status}. Please update your payment method or contact support.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Active Subscription</AlertTitle>
              <AlertDescription>
                Subscribe to unlock premium features and benefits for your contractor business.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Earnings</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatCurrency(stats.monthlyEarnings)}</div>
                <p className="text-sm text-muted-foreground">This month</p>
                {stats.earningsGrowth !== 0 && (
                  <div className={`flex items-center mt-2 text-xs ${stats.earningsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${stats.earningsGrowth < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(stats.earningsGrowth)}% from last month</span>
                  </div>
                )}
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
                {subscription && subscription.status === 'active' ? (
                  <>
                    <div className="text-3xl font-bold text-primary">{creditInfo?.creditsBalance ?? contractor?.creditsBalance ?? 0}</div>
                    <p className="text-sm text-muted-foreground">of {creditInfo?.weeklyCreditsLimit ?? contractor?.weeklyCreditsLimit ?? 3} remaining this week</p>
                    <div className="flex items-center mt-2 text-xs">
                      <Bell className="h-3 w-3 mr-1" />
                      <span>Resets {getNextResetDate()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-muted-foreground">0</div>
                    <p className="text-sm text-muted-foreground">Credits available for subscribers only</p>
                    <div className="flex items-center mt-2 text-xs text-orange-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>Subscribe to access credits</span>
                    </div>
                  </>
                )}
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
                {(() => {
                  const total = activeJobs.length + completedJobs.length;
                  const rate = total > 0 ? Math.round((completedJobs.length / total) * 100) : 0;
                  return (
                    <>
                      <div className="text-3xl font-bold text-primary">{rate}%</div>
                      <p className="text-sm text-muted-foreground">From {total} total projects</p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Profile</CardTitle>
              <CardDescription>
                {contractor?.businessName || contractor?.user?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4">
                  {contractor?.logoUrl ? (
                    <Image
                      src={contractor.logoUrl}
                      alt="Business Logo"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{contractor?.businessName?.slice(0,2).toUpperCase() || contractor?.user?.name?.slice(0,2).toUpperCase() || 'PC'}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                    {contractor?.tier || 'Standard'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent" />
                    <span className="ml-1 font-medium">{contractor?.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span className="mx-1 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{contractor?.reviewCount || 0} reviews</span>
                  </div>
                  <p className="text-sm mt-1">{contractor?.servicesProvided || 'Specialty not set'}</p>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile completion</span>
                  <span className="font-medium">{(() => {
                    const fields = [
                      contractor?.businessName,
                      contractor?.description,
                      contractor?.businessAddress,
                      contractor?.city,
                      contractor?.postcode,
                      contractor?.phone,
                      contractor?.website,
                      contractor?.operatingArea,
                      contractor?.servicesProvided,
                      contractor?.yearsExperience,
                      contractor?.logoUrl,
                    ];
                    const filled = fields.filter(Boolean).length;
                    const percent = Math.round((filled / fields.length) * 100);
                    return `${percent}%`;
                  })()}</span>
                </div>
                <Progress value={(() => {
                  const fields = [
                    contractor?.businessName,
                    contractor?.description,
                    contractor?.businessAddress,
                    contractor?.city,
                    contractor?.postcode,
                    contractor?.phone,
                    contractor?.website,
                    contractor?.operatingArea,
                    contractor?.servicesProvided,
                    contractor?.yearsExperience,
                    contractor?.logoUrl,
                  ];
                  const filled = fields.filter(Boolean).length;
                  return Math.round((filled / fields.length) * 100);
                })()} className="h-2" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/profile">
                    Edit Profile
                  </Link>
                </Button>
                {contractor?.id && (
                  <Button variant="secondary" asChild className="flex-1">
                    <Link href={`/contractors/${contractor.id}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      View as Customer
                    </Link>
                  </Button>
                )}
              </div>
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
                  Jobs you&apos;re currently working on
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
                          {job.location} • {formatCurrency(job.budget ?? 0)}
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
                            {review.customer?.user?.name || review.customerName || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                  </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          &quot;{review.comment}&quot;
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
                          {formatLocationForApplication(application.job)}
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
                          &quot;{application.coverLetter.substring(0, 150)}...&quot;
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
                          {job.location} • {formatCurrency(job.budget ?? 0)}
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
                          {job.location} • {formatCurrency(job.budget ?? 0)}
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
                            {review.customer?.user?.name || review.customerName || 'Anonymous'}
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
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/contractor/reviews">View All Reviews</Link>
                  </Button>
                </div>
              )}
            </CardContent>
              </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}