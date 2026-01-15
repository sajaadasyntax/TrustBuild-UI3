"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star, MapPin, DollarSign, CheckCircle2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { jobsApi, reviewsApi, handleApiError, Job, Review } from '@/lib/api'

interface ExtendedJob extends Job {
  hasAccess?: boolean;
  accessMethod?: string;
  accessType?: string;
}

export default function ContractorJobHistory() {
  const { user } = useAuth()
  const [completedJobs, setCompletedJobs] = useState<ExtendedJob[]>([])
  const [jobReviews, setJobReviews] = useState<Record<string, Review>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'CONTRACTOR') {
      fetchJobHistory()
    }
  }, [user])

  const fetchJobHistory = async () => {
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
      handleApiError(error, 'Failed to fetch job history')
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

  if (loading) {
    return (
      <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Completed Jobs</h1>
          <p className="text-muted-foreground">Your job history and earnings</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      {completedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{completedJobs.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviews Received</p>
                  <p className="text-2xl font-bold">{Object.keys(jobReviews).length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {completedJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You don&apos;t have any completed jobs yet</p>
              <Button asChild>
                <Link href="/jobs">Browse Available Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          completedJobs.map((job) => {
            const rating = getJobRating(job.id)
            const review = getJobReview(job.id)
            return (
              <Card key={job.id} className="dashboard-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {job.title}
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </CardTitle>
                      <CardDescription>{job.service?.name}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {rating && (
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                          <Star className="h-4 w-4 fill-yellow-500 stroke-yellow-500 mr-1" />
                          <span className="font-medium">{rating}/5</span>
                        </div>
                      )}
                      <Badge className="bg-green-600">Completed</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Final: {formatCurrency(job.finalAmount || job.budget)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Completed {getTimeAgo(job.completionDate || job.updatedAt)}
                    </span>
                  </div>
                  {review?.comment && (
                    <div className="bg-muted/50 rounded-md p-3 mt-2">
                      <p className="text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                      <p className="text-xs text-muted-foreground mt-1">— Customer Review</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/dashboard/contractor/jobs/${job.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
} 