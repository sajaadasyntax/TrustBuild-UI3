"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star, MapPin, DollarSign, CheckCircle2, ArrowLeft, PoundSterling, Award } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { jobsApi, reviewsApi, handleApiError, Job, Review } from '@/lib/api'

interface ExtendedJob extends Job {
  hasAccess?: boolean;
  accessMethod?: string;
  accessType?: string;
}

export default function ContractorCompletedJobs() {
  const { user } = useAuth()
  const [completedJobs, setCompletedJobs] = useState<ExtendedJob[]>([])
  const [jobReviews, setJobReviews] = useState<Record<string, Review>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'CONTRACTOR') {
      fetchCompletedJobs()
    }
  }, [user])

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true)
      
      // Get all contractor's completed jobs
      const { jobs } = await jobsApi.getMyAllJobs({ status: 'COMPLETED' })
      setCompletedJobs(jobs)

      // Fetch reviews for completed jobs
      try {
        const reviews = await reviewsApi.getMyReceived()
        const reviewsMap: Record<string, Review> = {}
        reviews.forEach(review => {
          if (review.jobId) {
            reviewsMap[review.jobId] = review
          }
        })
        setJobReviews(reviewsMap)
      } catch (error) {
        console.warn('Failed to fetch reviews:', error)
      }
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch completed jobs')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const getJobRating = (jobId: string) => {
    const review = jobReviews[jobId]
    return review ? review.rating : null
  }

  const getJobReview = (jobId: string) => {
    return jobReviews[jobId]
  }

  // Calculate totals
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.finalAmount || job.budget || 0), 0)
  const reviewedJobsCount = completedJobs.filter(job => jobReviews[job.id]).length
  const averageRating = Object.values(jobReviews).length > 0 
    ? Object.values(jobReviews).reduce((sum, r) => sum + r.rating, 0) / Object.values(jobReviews).length 
    : 0

  if (loading) {
    return (
      <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              Completed Jobs
            </h1>
            <p className="text-muted-foreground mt-1">Your successfully finished projects and earnings history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/contractor/current-jobs">
                <Clock className="mr-2 h-4 w-4" />
                Current Jobs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/contractor">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Completed</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-800">{completedJobs.length}</p>
                  <p className="text-xs text-green-600 mt-1">Jobs</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Earnings</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-800">{formatCurrency(totalEarnings)}</p>
                  <p className="text-xs text-blue-600 mt-1">From completed work</p>
                </div>
                <PoundSterling className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Reviews Received</p>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-800">{reviewedJobsCount}</p>
                  <p className="text-xs text-yellow-600 mt-1">Of {completedJobs.length} jobs</p>
                </div>
                <Star className="h-10 w-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Average Rating</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-800">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Out of 5 stars</p>
                </div>
                <Award className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Jobs Yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Once you finish working on jobs and customers confirm completion, they will appear here.
                </p>
                <Button asChild>
                  <Link href="/jobs">Find Jobs to Work On</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            completedJobs.map((job) => {
              const rating = getJobRating(job.id)
              const review = getJobReview(job.id)
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {job.title}
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{job.service?.name}</span>
                          {job.jobSize && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {job.jobSize} Job
                              </Badge>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {rating && (
                          <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-500 stroke-yellow-500 mr-1" />
                            <span className="font-bold text-yellow-700">{rating}</span>
                            <span className="text-yellow-600 text-sm">/5</span>
                          </div>
                        )}
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <PoundSterling className="h-4 w-4" />
                        {formatCurrency(job.finalAmount || job.budget)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Completed {getTimeAgo(job.completionDate || job.updatedAt)}
                      </span>
                    </div>
                    {review?.comment && (
                      <div className="bg-muted/50 rounded-lg p-4 mt-3 border">
                        <div className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              — {review.customer?.user?.name || 'Customer Review'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!review && (
                      <div className="bg-muted/30 rounded-lg p-3 mt-3 border border-dashed">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          No review received yet for this job
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/dashboard/contractor/jobs/${job.id}`}>
                        View Job Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
