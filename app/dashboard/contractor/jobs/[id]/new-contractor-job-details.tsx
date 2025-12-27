"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, User, Phone, Mail, Clock, DollarSign, Star, CheckCircle, AlertCircle, PhoneCall, MessageCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { jobsApi, paymentsApi, contractorsApi, handleApiError, Job, Contractor, JobApplication } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from "@/components/ui/textarea"
import JobLeadAccessDialog from "@/components/JobLeadAccessDialog"
import { FinalPriceProposalDialog } from "@/components/jobs/FinalPriceProposalDialog"
import { CreateDisputeDialog } from '@/components/disputes/CreateDisputeDialog'
import JobWorkflowButtons from '@/components/jobs/JobWorkflowButtons'
import ContractorJobProgress from '@/components/jobs/ContractorJobProgress'
import Link from 'next/link'

interface ContractorJobDetailsProps {
  job: Job
  onJobUpdate: (jobId: string) => void
}

/**
 * Find the current contractor's application from the job applications list
 * Uses contractor ID as primary match (most reliable)
 */
function findMyApplication(
  applications: JobApplication[] | undefined,
  contractorId: string | undefined
): JobApplication | null {
  if (!applications || !contractorId) return null
  
  return applications.find(app => app.contractorId === contractorId) || null
}

/**
 * Check if the current contractor has won the job
 */
function checkIsJobWinner(
  job: Job,
  contractorId: string | undefined,
  myApplication: JobApplication | null
): boolean {
  if (!contractorId) return false
  
  // Primary check: direct contractor ID match
  if (job.wonByContractorId === contractorId) return true
  
  // Fallback: check via application's contractor ID
  if (myApplication && job.wonByContractorId === myApplication.contractorId) return true
  
  return false
}

export function NewContractorJobDetails({ job, onJobUpdate }: ContractorJobDetailsProps) {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [reviewRequest, setReviewRequest] = useState('')
  const [showReviewRequest, setShowReviewRequest] = useState(false)
  const [showFinalPriceDialog, setShowFinalPriceDialog] = useState(false)

  // Memoized application lookup - single source of truth
  const myApplication = useMemo(() => 
    findMyApplication(job.applications, contractor?.id),
    [job.applications, contractor?.id]
  )

  // Memoized winner check
  const isJobWinner = useMemo(() => 
    checkIsJobWinner(job, contractor?.id, myApplication),
    [job, contractor?.id, myApplication]
  )

  // Check if contractor has already claimed "I won the job"
  const hasClaimedWon = useMemo(() => {
    if (!contractor?.id || !job.jobAccess) return false
    const myAccess = job.jobAccess.find(access => access.contractorId === contractor.id)
    return myAccess?.claimedWon === true
  }, [job.jobAccess, contractor?.id])

  // Computed status values
  const applicationStatus = myApplication?.status || 'none'
  const canCompleteJob = job.status === 'IN_PROGRESS' && isJobWinner
  const canProposeFinalPrice = job.status === 'IN_PROGRESS' && isJobWinner
  const canRequestReview = job.status === 'COMPLETED' && isJobWinner
  const isAwaitingFinalPriceConfirmation = job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION' && isJobWinner

  // Fetch contractor data on mount and when job changes
  useEffect(() => {
    fetchContractorData()
    checkJobAccess()
  }, [job.id])

  // Re-check access when jobAccess or applications change
  useEffect(() => {
    if (contractor?.id) {
      checkJobAccess()
    }
  }, [job.jobAccess, job.applications, contractor?.id])

  const fetchContractorData = async () => {
    try {
      const [contractorData, subscriptionData] = await Promise.all([
        contractorsApi.getMyProfile(),
        paymentsApi.getSubscriptionStatus()
      ])
      
      setContractor(contractorData)
      setSubscription(subscriptionData.subscription)
    } catch (error) {
      handleApiError(error, 'Failed to load contractor data')
    }
  }

  const checkJobAccess = async () => {
    try {
      setCheckingAccess(true)
      const accessData = await jobsApi.checkAccess(job.id)
      setHasAccess(accessData.hasAccess)
    } catch (error) {
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleRequestJobAccess = () => {
    setShowAccessDialog(true)
  }

  const handleAccessGranted = useCallback(async () => {
    // Refresh all data after access is granted
    await Promise.all([
      fetchContractorData(),
      checkJobAccess()
    ])
    
    // Small delay for backend processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Refresh job data to get updated jobAccess with customer info
    await onJobUpdate(job.id)
    
    // Double-check access after job update
    await checkJobAccess()
    
    toast({
      title: "Access Granted! 🎉",
      description: "You can now see the customer's contact details. Call them directly to discuss the job!",
    })
  }, [job.id, onJobUpdate])

  const handleCompleteJob = async () => {
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
      setUpdating(true)
      await jobsApi.completeJobWithAmount(job.id, Number(finalAmount))
      toast({
        title: "Job Marked Complete!",
        description: `Job completed with amount £${finalAmount}. Waiting for customer confirmation.`,
      })
      onJobUpdate(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to mark job as complete')
    } finally {
      setUpdating(false)
    }
  }

  const handleRequestReview = async () => {
    if (!reviewRequest.trim()) {
      toast({
        title: "Message Required",
        description: "Please add a message for your review request.",
        variant: "destructive"
      })
      return
    }

    try {
      setUpdating(true)
      await jobsApi.requestReview(job.id)
      toast({
        title: "Review Request Sent!",
        description: "Your review request has been sent to the customer.",
      })
      setShowReviewRequest(false)
      setReviewRequest('')
    } catch (error) {
      handleApiError(error, 'Failed to send review request')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'POSTED': 'default',
      'IN_PROGRESS': 'secondary',
      'COMPLETED': 'outline',
      'CANCELLED': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>
  }

  const getApplicationStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'PENDING': { variant: 'outline', label: 'Application Pending' },
      'ACCEPTED': { variant: 'secondary', label: 'Application Accepted' },
      'REJECTED': { variant: 'destructive', label: 'Application Rejected' },
      'none': { variant: 'default', label: 'Not Applied' }
    }
    const { variant, label } = config[status] || { variant: 'default', label: status }
    return <Badge variant={variant}>{label}</Badge>
  }

  // Loading state
  if (checkingAccess) {
    return (
      <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-12 max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(job.status)}
              {getApplicationStatusBadge(applicationStatus)}
              {isJobWinner && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Selected Winner
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscription?.isActive && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Subscription Active - Free job access included
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Balance Display - Only for active subscribers */}
        {contractor && subscription?.status === 'active' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Credits Balance: {contractor.creditsBalance}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchContractorData}
                  className="text-sm"
                >
                  Refresh Balance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Required Notice for Credits */}
        {contractor && (!subscription || subscription.status !== 'active') && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <span className="font-medium text-orange-800">Credits Available for Subscribers</span>
                  <p className="text-sm text-orange-700">
                    Subscribe to access credit features and get 3 free credits every week!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Granted Notice - Show when contractor has access or has won */}
        {(hasAccess || isJobWinner) && job.status === 'POSTED' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Access Granted! 🎉</h3>
                  <p className="text-green-700">
                    You can now see the customer&apos;s contact details below. <strong>Call them directly</strong> to discuss the job and agree on terms.
                  </p>
                </div>
              </div>
              
              {/* Customer Contact Card - Prominent display for direct contact */}
              {job.customer && (
                <div className="bg-white rounded-lg border border-green-200 p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-green-600" />
                    Contact Customer Now
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-lg font-medium">{job.customer.user?.name}</span>
                    </div>
                    {job.customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <a 
                          href={`tel:${job.customer.phone}`} 
                          className="text-lg font-semibold text-green-700 hover:text-green-800 underline"
                        >
                          {job.customer.phone}
                        </a>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => window.location.href = `tel:${job.customer.phone}`}
                        >
                          <PhoneCall className="w-4 h-4 mr-1" />
                          Call Now
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <a 
                        href={`mailto:${job.customer.user?.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {job.customer.user?.email}
                      </a>
                    </div>
                  </div>
                  {!hasClaimedWon && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Next Step:</strong> Call the customer to discuss the job details, negotiate price, and agree on terms. 
                        Once they agree to hire you, click <strong>&quot;I Won the Job&quot;</strong> below.
                      </p>
                    </div>
                  )}
                  {hasClaimedWon && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>✅ You&apos;ve already claimed this job!</strong> The customer has been notified and will confirm if you won. 
                        Please wait for their confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Access Required Notice - Hide if contractor has won the job */}
        {!hasAccess && !isJobWinner && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Job Access Required</h3>
                  <p className="text-orange-700">
                    Purchase access to view customer contact details and claim this job.
                  </p>
                </div>
              </div>
              <Button onClick={handleRequestJobAccess} className="w-full">
                Purchase Job Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Job Progress Tracker - Shows contractor where they are in the workflow */}
        <ContractorJobProgress
          job={job}
          hasAccess={hasAccess}
          myApplication={myApplication}
          isJobWinner={isJobWinner}
          hasClaimedWon={hasClaimedWon}
          onClaimWon={() => {
            // This will be handled by JobWorkflowButtons, but we show the guidance here
          }}
          onProposeFinalPrice={() => setShowFinalPriceDialog(true)}
        />

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{(hasAccess || isJobWinner) ? job.location : `${job.postcode || 'Location'} area`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>Budget: {job.budget ? `£${job.budget}` : 'Not specified'}</span>
                </div>
              </div>
              
              {/* Customer Contact - Visible after purchasing access or if contractor won */}
              {(hasAccess || isJobWinner) && job.customer && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-900">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                    Customer Contact
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{job.customer.user?.name}</span>
                    </div>
                    {job.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <a 
                          href={`tel:${job.customer.phone}`}
                          className="font-semibold text-green-700 hover:text-green-800 underline"
                        >
                          {job.customer.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`mailto:${job.customer.user?.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {job.customer.user?.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {(hasAccess || isJobWinner) ? job.description : (job.description?.substring(0, 200) + '...')}
              </p>
            </div>

            {/* Customer Notes - Only visible if hasAccess or won */}
            {(hasAccess || isJobWinner) && job.notes && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Customer Notes
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border">
                  {job.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Dispute Section for Contractors */}
        {(hasAccess || isJobWinner) && (['IN_PROGRESS', 'AWAITING_FINAL_PRICE_CONFIRMATION', 'COMPLETED', 'DISPUTED'].includes(job.status)) && (
          <Card className="border-muted">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                Need to report an issue?
              </h3>
              <div className="space-y-3">
                {/* Job Confirmation Issue */}
                {job.status === 'COMPLETED' && !job.customerConfirmed && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 mb-1">
                      Job completed but not confirmed?
                    </p>
                    <p className="text-sm text-orange-700">
                      If you have completed the work but the customer has not confirmed, 
                      you can open a dispute for commission payment.
                    </p>
                  </div>
                )}

                {/* Credit Refund for Cancelled Jobs */}
                {job.status === 'CANCELLED' && job.jobAccess?.some(access => access.creditUsed) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Job cancelled? Request credit refund
                    </p>
                    <p className="text-sm text-blue-700">
                      If the job was cancelled before work started and you used a credit, 
                      you may be eligible for a refund.
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Report issues with job confirmation, payment, delays, or other concerns.
                  Our support team will help resolve it.
                </p>
                
                <div className="flex gap-3">
                  <CreateDisputeDialog 
                    jobId={job.id} 
                    jobTitle={job.title}
                    trigger={
                      <Button variant="outline" className="text-orange-600 border-orange-300">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Open Dispute
                      </Button>
                    }
                  />
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/contractor/disputes">
                      View My Disputes
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Workflow Buttons */}
        <JobWorkflowButtons
          jobId={job.id}
          jobStatus={job.status}
          jobTitle={job.title}
          isContractor={true}
          isCustomer={false}
          isWonByMe={isJobWinner}
          finalAmount={job.finalAmount ? Number(job.finalAmount) : undefined}
          contractorProposedAmount={job.contractorProposedAmount ? Number(job.contractorProposedAmount) : undefined}
          hasAccess={hasAccess}
          hasClaimedWon={hasClaimedWon}
          contractorName={undefined}
          onUpdate={() => onJobUpdate(job.id)}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {canProposeFinalPrice && (
            <Button 
              onClick={() => setShowFinalPriceDialog(true)} 
              className="flex-1 min-w-[200px]"
            >
              Propose Final Price
            </Button>
          )}

          {isAwaitingFinalPriceConfirmation && (
            <div className="flex-1 min-w-[200px] p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Waiting for Customer Confirmation</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Final price of £{job.contractorProposedAmount?.toFixed(2)} proposed. 
                Customer has 7 days to respond.
              </p>
            </div>
          )}

          {canRequestReview && (
            <Button 
              onClick={() => setShowReviewRequest(true)}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              Request Review
            </Button>
          )}
        </div>

        {/* Review Request Form */}
        {showReviewRequest && (
          <Card>
            <CardHeader>
              <CardTitle>Request Customer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add a personal message to your review request..."
                value={reviewRequest}
                onChange={(e) => setReviewRequest(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleRequestReview} disabled={updating}>
                  {updating ? 'Sending...' : 'Send Review Request'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewRequest(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <JobLeadAccessDialog
          job={job}
          isOpen={showAccessDialog}
          onClose={() => setShowAccessDialog(false)}
          onAccessGranted={handleAccessGranted}
        />

        <FinalPriceProposalDialog
          jobId={job.id}
          jobTitle={job.title}
          isOpen={showFinalPriceDialog}
          onClose={() => setShowFinalPriceDialog(false)}
          onSuccess={() => onJobUpdate(job.id)}
        />
      </div>
    </div>
  )
}
