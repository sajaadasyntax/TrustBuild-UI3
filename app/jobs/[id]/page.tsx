"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Phone,
  Mail,
  PhoneCall
} from 'lucide-react'
import { jobsApi, handleApiError, Job, JobApplication } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import JobLeadAccessDialog from '@/components/JobLeadAccessDialog'
import ContractorJobProgress from '@/components/jobs/ContractorJobProgress'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (job && user?.role === 'CONTRACTOR') {
      checkJobAccess(job.id)
    } else if (job && user?.role !== 'CONTRACTOR') {
      // For non-contractors, set access check as complete
      setCheckingAccess(false)
    }
  }, [job, user])

  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true)
      const jobData = await jobsApi.getById(jobId)
      setJob(jobData)
      
      // For contractors, keep loading state until access check is complete
      if (user?.role === 'CONTRACTOR') {
        setCheckingAccess(true)
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch job details')
      router.push('/jobs')
    } finally {
      // Only set loading to false for non-contractors
      if (user?.role !== 'CONTRACTOR') {
        setLoading(false)
      }
    }
  }

  const checkJobAccess = async (jobId: string) => {
    try {
      setCheckingAccess(true)
      const accessData = await jobsApi.checkAccess(jobId)
      setHasAccess(accessData.hasAccess)
    } catch (error) {
      console.error('Error checking job access:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
      setLoading(false) // Now safe to show content
    }
  }

  // Silent re-fetch that does NOT reset loading/checkingAccess states (used after purchase)
  const refreshJobQuietly = async (jobId: string) => {
    try {
      const jobData = await jobsApi.getById(jobId)
      setJob(jobData)
      // Re-verify access quietly without touching loading state
      try {
        const accessData = await jobsApi.checkAccess(jobId)
        setHasAccess(accessData.hasAccess)
      } catch {
        // Keep the optimistic hasAccess = true if the check fails
      }
    } catch (error) {
      console.error('Silent job refresh failed:', error)
    }
  }

  const handleAccessGranted = async (purchaseResult?: any) => {
    // Optimistically set access immediately so the UI updates instantly
    setHasAccess(true)
    setShowAccessDialog(false)
    
    if (job) {
      // Immediately update the job with customer contact details from the purchase response
      if (purchaseResult && purchaseResult.customerContact) {
        const updatedJob = {
          ...job,
          customer: {
            ...job.customer,
            phone: purchaseResult.customerContact.phone || job.customer.phone,
            user: {
              ...job.customer.user,
              name: purchaseResult.customerContact.name || job.customer.user.name,
              email: purchaseResult.customerContact.email || job.customer.user.email
            }
          }
        };
        setJob(updatedJob);
      }
      
      toast({
        title: "Access Granted! 🎉",
        description: "Customer contact details are now available.",
      });
      
      // Quietly refresh full job data in the background without resetting the page to loading
      await refreshJobQuietly(job.id)
    }
  }


  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'POSTED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  // Find contractor's application for this job
  const getMyApplication = (): JobApplication | null => {
    if (!job || !user || user.role !== 'CONTRACTOR') return null
    return job.applications?.find(app => app.contractor?.userId === user.id) || null
  }

  // Check if contractor is the job winner
  const getIsJobWinner = (): boolean => {
    if (!job || !user) return false
    const myApp = getMyApplication()
    if (!myApp) return false
    return job.wonByContractorId === myApp.contractorId
  }

  const myApplication = getMyApplication()
  const isJobWinner = getIsJobWinner()


  // Helper function to show restricted content for contractors without access
  const showRestrictedContent = () => {
    return user?.role === 'CONTRACTOR' && !hasAccess && !checkingAccess
  }

  // Show loading if data is loading OR if contractor access check is in progress
  if (loading || (user?.role === 'CONTRACTOR' && checkingAccess)) {
    return (
      <div className="container py-16 md:py-32">
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

  if (!job) {
    return (
      <div className="container py-16 md:py-32">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16 md:py-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold mb-2">
                {showRestrictedContent() ? 'Job Available' : job.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.postcode ? `${job.postcode} area` : 'Location available after purchase'}
                </span>
                {!showRestrictedContent() && (
                  <>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatBudget(job.budget ?? 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!showRestrictedContent() && job.isUrgent && (
                <Badge className="bg-red-100 text-red-800">
                  Urgent
                </Badge>
              )}
              <Badge className={getStatusColor(job.status)}>
                {job.status.toLowerCase().replace('_', ' ')}
              </Badge>
              {showRestrictedContent() && (
                <Badge variant="outline">
                  {job.jobSize}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showRestrictedContent() ? 'Job Information' : 'Job Description'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showRestrictedContent() ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                        <Lock className="h-4 w-4" />
                        <span>Purchase Access to View Full Details</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Purchase access to see the complete job description, customer contact details, and submit your application.
                      </p>
                      <Button onClick={() => setShowAccessDialog(true)} size="sm">
                        Purchase Job Access
                      </Button>
                    </div>
                    
                    {/* Only show basic job info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Service Type</Label>
                        <p className="text-sm">{job.service?.name || 'General'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Job Size</Label>
                        <p className="text-sm">{job.jobSize}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Area</Label>
                        <p className="text-sm">{job.postcode ? `${job.postcode} area` : 'Available after purchase'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <p className="text-sm capitalize">{job.status.toLowerCase().replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap break-words">
                    {job.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {!showRestrictedContent() && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Service Type</Label>
                      <p className="text-muted-foreground">{job.service?.name || 'General'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Budget</Label>
                      <p className="text-muted-foreground">{formatBudget(job.budget ?? 0)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-muted-foreground">{job.location}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Timeline</Label>
                      <p className="text-muted-foreground">{job.urgency || 'Flexible'}</p>
                    </div>
                    {job.postcode && (
                      <div>
                        <Label className="text-sm font-medium">Postcode</Label>
                        <p className="text-muted-foreground">{job.postcode}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Progress Tracker for Contractors */}
            {user?.role === 'CONTRACTOR' && (
              <ContractorJobProgress
                job={job}
                hasAccess={hasAccess}
                myApplication={myApplication}
                isJobWinner={isJobWinner}
                onClaimWon={() => {
                  // Navigate to dashboard to use full workflow
                  router.push(`/dashboard/contractor/jobs/${job.id}`)
                }}
                onProposeFinalPrice={() => {
                  router.push(`/dashboard/contractor/jobs/${job.id}`)
                }}
              />
            )}


            {/* Job Phase Management for Assigned Contractors */}
            {user?.role === 'CONTRACTOR' && job.applications?.some(app => 
              app.contractor?.userId === user.id && app.status === 'ACCEPTED'
            ) && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Status Management</CardTitle>
                  <CardDescription>
                    Update the progress and status of this job.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Current Status</Label>
                      <p className="text-lg font-medium">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </p>
                    </div>
                    
                    {job.status === 'IN_PROGRESS' && (
                      <Button 
                        onClick={async () => {
                          // Use job budget as final amount automatically
                          const finalAmount = job.budget || 0
                          
                          if (finalAmount <= 0) {
                            toast({
                              title: "No Budget Set",
                              description: "This job doesn't have a budget set. Please contact the customer.",
                              variant: "destructive"
                            })
                            return
                          }

                          try {
                            await jobsApi.completeJobWithAmount(job.id, Number(finalAmount))
                            toast({
                              title: "Job completed!",
                              description: `Job completed with amount £${finalAmount} (from job budget). Waiting for customer confirmation.`,
                            })
                            await fetchJob(job.id)
                          } catch (error) {
                            console.error(`❌ Jobs Page - completeJobWithAmount failed:`, error)
                            handleApiError(error, 'Failed to complete job')
                          }
                        }}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Job
                      </Button>
                    )}

                    {/* Removed: Contractors cannot start work without customer confirmation
                         The customer must approve contractor selection first */}

                    {job.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        This job has been completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {showRestrictedContent() ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">Customer Details Locked</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Purchase access to view customer information and contact details.
                    </p>
                    <Button 
                      onClick={() => setShowAccessDialog(true)}
                      size="sm"
                    >
                      Purchase Access
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {job.customer.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{job.customer.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Member since {new Date(job.customer.createdAt).getFullYear()}
                        </p>
                      </div>
                    </div>

                    {/* Contact details - visible after purchase */}
                    {hasAccess && (
                      <div className="space-y-3 pt-3 border-t">
                        {job.customer.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-green-600" />
                            <a 
                              href={`tel:${job.customer.phone}`}
                              className="font-semibold text-green-700 hover:text-green-800 underline"
                            >
                              {job.customer.phone}
                            </a>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="ml-auto border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => window.location.href = `tel:${job.customer.phone}`}
                            >
                              <PhoneCall className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        )}
                        {job.customer.user.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <a 
                              href={`mailto:${job.customer.user.email}`}
                              className="text-blue-700 hover:text-blue-800 underline text-sm"
                            >
                              {job.customer.user.email}
                            </a>
                          </div>
                        )}
                        {!job.customer.phone && !job.customer.user.email && (
                          <p className="text-sm text-muted-foreground">
                            No contact details available for this customer.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Claims Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contractors Who Claimed</span>
                    <span className="font-medium">{job.applications?.length || 0}</span>
                  </div>
                  
                  {user?.role === 'CONTRACTOR' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {job.applications?.some(app => app.contractor?.userId === user.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          You have claimed this job
                        </>
                      ) : job.wonByContractorId ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          This job has been won by another contractor
                        </>
                      ) : job.status !== 'POSTED' ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Job is no longer available
                        </>
                      ) : null}
                    </div>
                  )}
                  
                  {job.status !== 'POSTED' && job.status !== 'DRAFT' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      This job is no longer accepting applications
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
             {job && (
         <JobLeadAccessDialog
           isOpen={showAccessDialog}
           onClose={() => setShowAccessDialog(false)}
           onAccessGranted={handleAccessGranted}
           job={{
             id: job.id,
             title: job.title,
             location: job.location,
             description: job.description,
             budget: job.budget,
             jobSize: job.jobSize,
             leadPrice: job.leadPrice,
             requiresQuote: false,
             service: job.service,
             contractorsWithAccess: job.contractorsWithAccess,
             maxContractorsPerJob: job.maxContractorsPerJob,
             spotsRemaining: job.spotsRemaining,
           }}
         />
       )}
    </div>
  )
}
