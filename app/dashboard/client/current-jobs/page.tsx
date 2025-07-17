"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, AlertCircle } from "lucide-react"
import { jobsApi, Job, handleApiError } from "@/lib/api"

export default function ClientCurrentJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await jobsApi.getMyPostedJobs()
        setJobs(response)
      } catch (err: any) {
        console.error('Error fetching jobs:', err)
        setError(err.message || 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  // Helper function to map status for display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'POSTED':
      case 'DRAFT':
        return { label: 'Open', variant: 'secondary' as const }
      case 'IN_PROGRESS':
        return { label: 'In Progress', variant: 'outline' as const }
      case 'COMPLETED':
        return { label: 'Completed', variant: 'default' as const }
      case 'CANCELLED':
        return { label: 'Cancelled', variant: 'destructive' as const }
      default:
        return { label: 'Open', variant: 'secondary' as const }
    }
  }

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Current Jobs</h1>
          <p className="text-muted-foreground">Manage your active projects</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-64" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You don&apos;t have any active jobs</p>
                <Button asChild className="mt-4">
                  <Link href="/post-job">Post Your First Job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const statusDisplay = getStatusDisplay(job.status)
              const applicationsCount = job.applications?.length || 0
              
              return (
                <Card key={job.id} className="dashboard-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{job.title}</CardTitle>
                      <Badge variant={statusDisplay.variant}>
                        {statusDisplay.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      Budget: {job.budget ? `£${job.budget.toLocaleString()}` : 'Quote on Request'} • {job.service?.name || 'Service'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {job.status === 'POSTED' || job.status === 'DRAFT' ? (
                        <span>Posted {formatDate(job.createdAt)} • {applicationsCount} applications</span>
                      ) : job.status === 'IN_PROGRESS' ? (
                        <span>In progress since {formatDate(job.updatedAt)}</span>
                      ) : job.status === 'COMPLETED' ? (
                        <span>Completed on {formatDate(job.completionDate || job.updatedAt)}</span>
                      ) : (
                        <span>Updated {formatDate(job.updatedAt)}</span>
                      )}
                    </div>
                    
                    {job.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/dashboard/client/jobs/${job.id}`}>
                        {job.status === 'POSTED' || job.status === 'DRAFT' 
                          ? 'View Applications' 
                          : job.status === 'IN_PROGRESS'
                          ? 'View Progress'
                          : 'View Details'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
} 