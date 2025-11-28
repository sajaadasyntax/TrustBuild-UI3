"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NewContractorJobDetails } from "./new-contractor-job-details"
import { jobsApi, contractorsApi, handleApiError, Job, Contractor } from '@/lib/api'

/**
 * Check if contractor has access to view this job
 * Access is granted if:
 * 1. API indicates hasAccess = true
 * 2. Contractor has a record in jobAccess
 * 3. Contractor has an accepted application
 * 4. Contractor is the job winner
 */
function checkJobAccessPermission(
  job: Job,
  contractor: Contractor
): boolean {
  // Check API-level access flag
  if (job.hasAccess) return true
  
  // Check jobAccess records
  const hasJobAccess = job.jobAccess?.some(
    access => access.contractorId === contractor.id
  )
  if (hasJobAccess) return true
  
  // Check if contractor has an application (any status - they've already paid for access)
  const hasApplication = job.applications?.some(
    app => app.contractorId === contractor.id
  )
  if (hasApplication) return true
  
  // Check if contractor is the winner
  if (job.wonByContractorId === contractor.id) return true
  
  return false
}

export default function ContractorJobPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJob = useCallback(async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch job data and contractor profile in parallel
      const [jobData, contractorData] = await Promise.all([
        jobsApi.getById(jobId),
        contractorsApi.getMyProfile()
      ])
      
      setContractor(contractorData)
      
      // Check access permission
      const hasPermission = checkJobAccessPermission(jobData, contractorData)
      
      if (!hasPermission) {
        // Redirect to contractor dashboard if no access
        router.push('/dashboard/contractor')
        return
      }
      
      setJob(jobData)
    } catch (err) {
      handleApiError(err, 'Failed to fetch job details')
      setError('Failed to load job details')
      // Redirect on error
      router.push('/dashboard/contractor')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const jobId = params.id as string
    if (jobId) {
      fetchJob(jobId)
    }
  }, [params.id, fetchJob])

  // Loading state
  if (loading) {
    return (
      <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !job) {
    return (
      <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Job not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The job you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to view it.
          </p>
          <button
            onClick={() => router.push('/dashboard/contractor')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <NewContractorJobDetails job={job} onJobUpdate={fetchJob} />
}
