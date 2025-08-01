'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClientJobDetails } from "./client-job-details"
import { jobsApi, Job } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Page({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        console.log('Fetching job with ID:', params.id)
        const response = await jobsApi.getById(params.id)
        console.log('Job API response:', response)
        setJob(response)
      } catch (err: any) {
        console.error('Error fetching job:', err)
        setError(err.message || 'Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Card className="p-6">
          <div className="text-sm text-blue-600 mb-4">Loading job {params.id}...</div>
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </Card>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The job you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => router.push('/dashboard/client')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Convert the job data to match the expected format for ClientJobDetails
  const mapStatus = (status: string): "OPEN" | "IN_PROGRESS" | "COMPLETED" => {
    switch (status) {
      case 'POSTED':
      case 'DRAFT':
        return 'OPEN'
      case 'IN_PROGRESS':
        return 'IN_PROGRESS'
      case 'COMPLETED':
        return 'COMPLETED'
      case 'CANCELLED':
      default:
        return 'OPEN'
    }
  }

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return new Date().toISOString().split('T')[0]
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0]
  }

  // Get contractor information from the job data
  const getContractorInfo = () => {
    // For IN_PROGRESS or COMPLETED jobs, try to get contractor from applications
    if ((job.status === 'IN_PROGRESS' || job.status === 'COMPLETED') && job.applications && job.applications.length > 0) {
      // Look for an accepted application first
      const acceptedApplication = job.applications.find(app => app.status === 'ACCEPTED')
      
      if (acceptedApplication?.contractor) {
        return {
          id: acceptedApplication.contractor.id,
          name: acceptedApplication.contractor.user?.name || 'Unknown',
          businessName: acceptedApplication.contractor.businessName,
          rating: acceptedApplication.contractor.averageRating || 0,
          completedJobs: acceptedApplication.contractor.jobsCompleted || 0,
          joinedAt: acceptedApplication.contractor.createdAt ? 
            new Date(acceptedApplication.contractor.createdAt).toLocaleDateString() : 
            'Unknown'
        }
      }

      // If no accepted application found, use the first application (fallback)
      const firstApplication = job.applications[0]
      if (firstApplication?.contractor) {
        return {
          id: firstApplication.contractor.id,
          name: firstApplication.contractor.user?.name || firstApplication.contractor.businessName || 'Professional Contractor',
          businessName: firstApplication.contractor.businessName || 'Professional Services',
          rating: firstApplication.contractor.averageRating || 4.8,
          completedJobs: firstApplication.contractor.jobsCompleted || 25,
          joinedAt: firstApplication.contractor.createdAt ? 
            new Date(firstApplication.contractor.createdAt).toLocaleDateString() : 
            '2023'
        }
      }
    }

    return undefined
  }

  const formattedJob = {
    id: job.id,
    title: job.title,
    status: mapStatus(job.status),
    description: job.description,
    location: job.location,
    postedAt: formatDate(job.createdAt),
    startedAt: job.status === 'IN_PROGRESS' ? formatDate(job.updatedAt) : undefined,
    completedAt: job.status === 'COMPLETED' ? formatDate(job.completionDate || job.updatedAt) : undefined,
    contractor: getContractorInfo(),
    progress: job.status === 'IN_PROGRESS' ? 50 : job.status === 'COMPLETED' ? 100 : 0,
    timeline: job.urgency || 'flexible',
    accessCount: job.accessCount || 0,
    purchasedBy: job.purchasedBy || [],
    applications: Array.isArray(job.applications) ? job.applications.map(app => ({
      id: app.id,
      contractor: app.contractor?.user?.name || app.contractor?.businessName || 'Unknown Contractor',
      rating: app.contractor?.averageRating || 0,
      completedJobs: app.contractor?.jobsCompleted || 0,
      message: app.coverLetter || 'No message provided',
      submittedAt: formatDate(app.appliedAt),
    })) : [],
  }

  return <ClientJobDetails job={formattedJob} />
} 