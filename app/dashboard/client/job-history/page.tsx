"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star, MapPin, DollarSign, User } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { jobsApi, handleApiError, Job } from '@/lib/api'

export default function ClientJobHistory() {
  const { user } = useAuth()
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      fetchJobHistory()
    }
  }, [user])

  const fetchJobHistory = async () => {
    try {
      setLoading(true)
      
      // Get customer's posted jobs and filter for completed ones
      const allJobs = await jobsApi.getMyPostedJobs()
      const completedJobsData = allJobs.filter(job => job.status === 'COMPLETED')
      
      setCompletedJobs(completedJobsData)
      
    } catch (error) {
      handleApiError(error, 'Failed to fetch job history')
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

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const getAssignedContractor = (job: Job) => {
    const acceptedApplication = job.applications?.find(app => app.status === 'ACCEPTED')
    return acceptedApplication?.contractor
  }

  const getJobRating = (job: Job) => {
    // Get the review for this job
    const review = job.reviews?.[0]
    return review ? review.rating : null
  }

  if (loading) {
    return (
      <div className="container py-32">
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
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job History</h1>
          <p className="text-muted-foreground">View your completed projects</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {completedJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You don&apos;t have any completed jobs yet</p>
              <Button asChild>
                <Link href="/post-job">Post Your First Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          completedJobs.map((job) => {
            const contractor = getAssignedContractor(job)
            const rating = getJobRating(job)
            
            return (
              <Card key={job.id} className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{job.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                          <span>{rating}</span>
                        </div>
                      )}
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(job.budget)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    {contractor && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {contractor.businessName || contractor.user?.name}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Completed {getTimeAgo(job.completionDate || job.updatedAt)}</span>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2 gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/dashboard/client/jobs/${job.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {!rating && contractor && (
                    <Button variant="default" asChild className="flex-1">
                      <Link href={`/dashboard/client/jobs/${job.id}?review=true`}>
                        Leave Review
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
} 