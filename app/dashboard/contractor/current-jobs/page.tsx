"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, DollarSign } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { jobsApi, handleApiError, Job } from '@/lib/api'

export default function ContractorCurrentJobs() {
  const { user } = useAuth()
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === 'CONTRACTOR') {
      fetchActiveJobs()
    }
  }, [user])

  const fetchActiveJobs = async () => {
    try {
      setLoading(true)
      
      // Get contractor's applications and filter for accepted ones with active jobs
      const applications = await jobsApi.getMyApplications()
      const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED')
      const activeJobsData = acceptedApplications
        .map(app => app.job)
        .filter(job => ['IN_PROGRESS', 'DISPUTED'].includes(job.status))
      
      setActiveJobs(activeJobsData)
    } catch (error) {
      handleApiError(error, 'Failed to fetch active jobs')
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

  const calculateProgress = (job: Job) => {
    // Calculate progress based on job timeline or milestones
    // For now, use a simple calculation based on creation date
    const daysSinceStart = Math.floor((new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const estimatedDuration = job.urgency === 'asap' ? 3 : job.urgency === 'week' ? 7 : 14
    return Math.min(Math.floor((daysSinceStart / estimatedDuration) * 100), 90)
  }

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    return `${Math.floor(days / 7)} weeks ago`
  }

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
          <h1 className="text-3xl font-bold">Current Jobs</h1>
          <p className="text-muted-foreground">Manage your active projects</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You don&apos;t have any active jobs</p>
              <Button asChild>
                <Link href="/jobs">Browse Available Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeJobs.map((job) => (
            <Card key={job.id} className="dashboard-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{job.title}</CardTitle>
                  <Badge variant={['DISPUTED'].includes(job.status) ? 'destructive' : 'outline'}>
                    {['DISPUTED'].includes(job.status) ? 'Disputed' : 'In Progress'}
                  </Badge>
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
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Started {getTimeAgo(job.createdAt)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Progress</span>
                    <span>{calculateProgress(job)}%</span>
                  </div>
                  <Progress value={calculateProgress(job)} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/contractor/jobs/${job.id}`}>
                    View Details & Update Progress
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 