"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NewContractorJobDetails } from "./new-contractor-job-details"
import { jobsApi, contractorsApi, handleApiError, Job } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id])

  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true)
      console.log('🔄 Fetching job data for:', jobId)
      const jobData = await jobsApi.getById(jobId)
      console.log('📋 Job data received:', {
        id: jobData.id,
        title: jobData.title,
        hasCustomer: !!jobData.customer,
        customerName: jobData.customer?.user?.name,
        customerPhone: jobData.customer?.phone,
        customerEmail: jobData.customer?.user?.email,
        hasAccess: jobData.hasAccess
      })
      
      // Allow contractors who have purchased access OR are assigned to view the job
      // This allows contractors to apply and claim "I won the job" after purchasing access
      const contractor = await contractorsApi.getMyProfile()
      const hasAccess = jobData.hasAccess || jobData.jobAccess?.some(access => 
        access.contractorId === contractor.id
      )
      const isAssigned = jobData.applications?.some(app => 
        app.contractor?.userId === user?.id && app.status === 'ACCEPTED'
      ) || jobData.wonByContractorId === contractor.id
      
      // Allow access if contractor has purchased access OR is assigned
      if (!hasAccess && !isAssigned) {
        router.push('/dashboard/contractor')
        return
      }
      
      setJob(jobData)
    } catch (error) {
      handleApiError(error, 'Failed to fetch job details')
      router.push('/dashboard/contractor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-32">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found or not assigned</h1>
        </div>
      </div>
    )
  }

  return <NewContractorJobDetails job={job} onJobUpdate={fetchJob} />
}

// Legacy mock data for reference
const legacyMockJobs = [
  {
    id: "job1",
    title: "Living Room Redesign",
    status: "IN_PROGRESS" as const,
    description: "Complete living room redesign including new furniture, paint, and flooring. The space is approximately 300 square feet.",
    budget: "£4,500",
    location: "London, UK",
    startedAt: "2024-03-15",
    customer: {
      name: "John Smith",
      rating: 4.8,
      completedJobs: 3,
      joinedAt: "2023",
    },
    progress: 65,
    timeline: "3-4 weeks",
    milestones: [
      {
        id: "milestone1",
        title: "Initial Consultation",
        status: "COMPLETED" as const,
        completedAt: "2024-03-15",
      },
      {
        id: "milestone2",
        title: "Design Approval",
        status: "COMPLETED" as const,
        completedAt: "2024-03-18",
      },
      {
        id: "milestone3",
        title: "Furniture Delivery",
        status: "IN_PROGRESS" as const,
        dueDate: "2024-03-25",
      },
      {
        id: "milestone4",
        title: "Installation",
        status: "PENDING" as const,
        dueDate: "2024-03-28",
      },
    ],
  },
  {
    id: "job2",
    title: "Kitchen Renovation",
    status: "IN_PROGRESS" as const,
    description: "Complete kitchen renovation including new cabinets, countertops, appliances, and flooring. The space is approximately 200 square feet.",
    budget: "£5,000",
    location: "London, UK",
    startedAt: "2024-03-10",
    customer: {
      name: "Sarah Johnson",
      rating: 4.9,
      completedJobs: 5,
      joinedAt: "2022",
    },
    progress: 45,
    timeline: "4-6 weeks",
    milestones: [
      {
        id: "milestone1",
        title: "Initial Consultation",
        status: "COMPLETED" as const,
        completedAt: "2024-03-10",
      },
      {
        id: "milestone2",
        title: "Design Approval",
        status: "COMPLETED" as const,
        completedAt: "2024-03-13",
      },
      {
        id: "milestone3",
        title: "Demolition",
        status: "COMPLETED" as const,
        completedAt: "2024-03-15",
      },
      {
        id: "milestone4",
        title: "Cabinetry Installation",
        status: "IN_PROGRESS" as const,
        dueDate: "2024-03-25",
      },
    ],
  },
]

// No longer needed with dynamic API data
// export function generateStaticParams() {
//   return mockJobs.map((job) => ({
//     id: job.id,
//   }))
// } 