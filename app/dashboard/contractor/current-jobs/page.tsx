"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, DollarSign, CreditCard, Coins, CheckCircle2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { jobsApi, handleApiError, Job } from '@/lib/api'

interface ExtendedJob extends Job {
  hasAccess?: boolean;
  accessMethod?: string;
  accessType?: string;
  accessedAt?: string;
  claimedWon?: boolean;
}

export default function ContractorCurrentJobs() {
  const { user } = useAuth()
  const [activeJobs, setActiveJobs] = useState<ExtendedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user && user.role === 'CONTRACTOR') {
      fetchActiveJobs()
    }
  }, [user])

  const fetchActiveJobs = async () => {
    try {
      setLoading(true)
      
      // Get all contractor's jobs with ACTIVE status (includes POSTED, IN_PROGRESS, WON, AWAITING_FINAL_PRICE_CONFIRMATION)
      const { jobs } = await jobsApi.getMyAllJobs({ status: 'ACTIVE' })
      setActiveJobs(jobs)
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

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    return `${Math.floor(days / 7)} weeks ago`
  }

  const getStatusBadge = (job: ExtendedJob) => {
    if (job.status === 'DISPUTED') {
      return <Badge variant="destructive">Disputed</Badge>
    }
    if (job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION') {
      return <Badge className="bg-amber-500">Awaiting Confirmation</Badge>
    }
    if (job.status === 'WON' || job.claimedWon) {
      return <Badge className="bg-green-600">Won Job</Badge>
    }
    if (job.status === 'IN_PROGRESS') {
      return <Badge className="bg-blue-600">In Progress</Badge>
    }
    return <Badge variant="outline">Available</Badge>
  }

  const getAccessMethodIcon = (job: ExtendedJob) => {
    if (job.accessMethod === 'CREDIT') {
      return <Coins className="h-3 w-3 text-yellow-600" />
    }
    return <CreditCard className="h-3 w-3 text-blue-600" />
  }

  // Filter jobs by tab
  const getFilteredJobs = () => {
    if (activeTab === 'all') return activeJobs
    if (activeTab === 'won') return activeJobs.filter(job => job.status === 'WON' || job.claimedWon || job.status === 'IN_PROGRESS')
    if (activeTab === 'available') return activeJobs.filter(job => job.status === 'POSTED' && !job.claimedWon)
    return activeJobs
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

  const filteredJobs = getFilteredJobs()

  return (
    <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Active Jobs</h1>
          <p className="text-muted-foreground">Manage your active jobs and leads</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="won">
            Won / In Progress ({activeJobs.filter(j => j.status === 'WON' || j.claimedWon || j.status === 'IN_PROGRESS').length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({activeJobs.filter(j => j.status === 'POSTED' && !j.claimedWon).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No jobs found in this category</p>
              <Button asChild>
                <Link href="/jobs">Browse Available Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="dashboard-card hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {job.title}
                      {job.claimedWon && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </CardTitle>
                    <CardDescription>{job.service?.name}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(job)}
                    {job.hasAccess && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        {getAccessMethodIcon(job)}
                        {job.accessMethod === 'CREDIT' ? 'Credit' : 'Paid'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(job.budget || job.estimatedValue)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.accessedAt ? `Purchased ${getTimeAgo(job.accessedAt)}` : `Posted ${getTimeAgo(job.createdAt)}`}
                  </span>
                </div>
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
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
          ))
        )}
      </div>
    </div>
  )
} 