/**
 * Job-related utilities for TrustBuild
 */

import { Job, JobApplication, Contractor } from '@/lib/api'

/**
 * Job status configuration
 */
export const JOB_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray', variant: 'outline' as const },
  POSTED: { label: 'Posted', color: 'blue', variant: 'default' as const },
  WON: { label: 'Won', color: 'purple', variant: 'secondary' as const },
  IN_PROGRESS: { label: 'In Progress', color: 'yellow', variant: 'secondary' as const },
  AWAITING_FINAL_PRICE_CONFIRMATION: { label: 'Awaiting Confirmation', color: 'orange', variant: 'outline' as const },
  COMPLETED: { label: 'Completed', color: 'green', variant: 'outline' as const },
  CANCELLED: { label: 'Cancelled', color: 'red', variant: 'destructive' as const },
  DISPUTED: { label: 'Disputed', color: 'red', variant: 'destructive' as const },
} as const

export type JobStatus = keyof typeof JOB_STATUS_CONFIG

/**
 * Get job status display info
 */
export function getJobStatusInfo(status: string) {
  return JOB_STATUS_CONFIG[status as JobStatus] || {
    label: status.replace(/_/g, ' '),
    color: 'gray',
    variant: 'default' as const,
  }
}

/**
 * Application status configuration
 */
export const APPLICATION_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'yellow', variant: 'outline' as const },
  ACCEPTED: { label: 'Accepted', color: 'green', variant: 'secondary' as const },
  REJECTED: { label: 'Rejected', color: 'red', variant: 'destructive' as const },
} as const

export type ApplicationStatus = keyof typeof APPLICATION_STATUS_CONFIG

/**
 * Get application status display info
 */
export function getApplicationStatusInfo(status: string) {
  return APPLICATION_STATUS_CONFIG[status as ApplicationStatus] || {
    label: status,
    color: 'gray',
    variant: 'default' as const,
  }
}

/**
 * Check if contractor has access to view a job
 */
export function checkContractorJobAccess(job: Job, contractor: Contractor): boolean {
  // Check API-level access flag
  if (job.hasAccess) return true
  
  // Check jobAccess records
  const hasJobAccess = job.jobAccess?.some(
    access => access.contractorId === contractor.id
  )
  if (hasJobAccess) return true
  
  // Check if contractor has an application
  const hasApplication = job.applications?.some(
    app => app.contractorId === contractor.id
  )
  if (hasApplication) return true
  
  // Check if contractor is the winner
  if (job.wonByContractorId === contractor.id) return true
  
  return false
}

/**
 * Find contractor's application for a job
 */
export function findContractorApplication(
  applications: JobApplication[] | undefined,
  contractorId: string | undefined
): JobApplication | null {
  if (!applications || !contractorId) return null
  return applications.find(app => app.contractorId === contractorId) || null
}

/**
 * Check if contractor has won the job
 */
export function isContractorJobWinner(
  job: Job,
  contractorId: string | undefined,
  application?: JobApplication | null
): boolean {
  if (!contractorId) return false
  
  // Primary check: direct contractor ID match
  if (job.wonByContractorId === contractorId) return true
  
  // Fallback: check via application
  if (application && job.wonByContractorId === application.contractorId) return true
  
  return false
}

/**
 * Calculate job progress based on status
 */
export function calculateJobProgress(status: string): number {
  const progressMap: Record<string, number> = {
    DRAFT: 0,
    POSTED: 10,
    WON: 30,
    IN_PROGRESS: 60,
    AWAITING_FINAL_PRICE_CONFIRMATION: 80,
    COMPLETED: 100,
    CANCELLED: 0,
    DISPUTED: 60,
  }
  
  return progressMap[status] ?? 0
}

/**
 * Get color class based on job status
 */
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    POSTED: 'bg-blue-100 text-blue-800',
    WON: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    AWAITING_FINAL_PRICE_CONFIRMATION: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    DISPUTED: 'bg-red-100 text-red-800',
  }
  
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Check if job can have applications
 */
export function canAcceptApplications(status: string): boolean {
  return status === 'POSTED'
}

/**
 * Check if job is in an active state
 */
export function isJobActive(status: string): boolean {
  return ['POSTED', 'WON', 'IN_PROGRESS', 'AWAITING_FINAL_PRICE_CONFIRMATION'].includes(status)
}

/**
 * Check if job is completed or cancelled
 */
export function isJobFinished(status: string): boolean {
  return ['COMPLETED', 'CANCELLED'].includes(status)
}

