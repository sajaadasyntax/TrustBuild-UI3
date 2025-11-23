"use client"

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, User, Phone, Mail, Clock, DollarSign, Star, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { jobsApi, paymentsApi, contractorsApi, reviewsApi, handleApiError, Job, Contractor } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Textarea } from "@/components/ui/textarea"
import JobLeadAccessDialog from "@/components/JobLeadAccessDialog"
import { FinalPriceProposalDialog } from "@/components/jobs/FinalPriceProposalDialog"
import { CreateDisputeDialog } from '@/components/disputes/CreateDisputeDialog'
import JobWorkflowButtons from '@/components/jobs/JobWorkflowButtons'
import JobApplicationDialog from '@/components/jobs/JobApplicationDialog'
import Link from 'next/link'

interface ContractorJobDetailsProps {
  job: Job
  onJobUpdate: (jobId: string) => void
}

export function NewContractorJobDetails({ job, onJobUpdate }: ContractorJobDetailsProps) {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [applicationStatus, setApplicationStatus] = useState<string>('none')
  const [reviewRequest, setReviewRequest] = useState('')
  const [showReviewRequest, setShowReviewRequest] = useState(false)
  const [showFinalPriceDialog, setShowFinalPriceDialog] = useState(false)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)

  // Get the application for this contractor
  const myApplication = job.applications?.find(app => 
    app.contractor?.userId === user?.id
  )

  useEffect(() => {
    fetchContractorData()
    checkJobAccess()
  }, [job.id, job.jobAccess]) // Refresh when job or jobAccess changes

  const fetchContractorData = async () => {
    try {
      // Fetch contractor profile with fresh data
      const contractorData = await contractorsApi.getMyProfile()
      setContractor(contractorData)

      // Fetch subscription status
      const { hasSubscription, subscription } = await paymentsApi.getSubscriptionStatus()
      setSubscription(subscription)

      console.log('Contractor data:', {
        credits: contractorData.creditsBalance,
        hasSubscription,
        subscription: subscription?.status
      })
    } catch (error) {
      console.error('Failed to fetch contractor data:', error)
    }
  }

  const checkJobAccess = async () => {
    try {
      setCheckingAccess(true)
      console.log('🔍 Checking job access for job:', job.id)
      const accessData = await jobsApi.checkAccess(job.id)
      console.log('🔍 Access check result:', accessData)
      setHasAccess(accessData.hasAccess)
      
      // Check application status
      if (myApplication) {
        setApplicationStatus(myApplication.status || 'PENDING')
      }
    } catch (error) {
      console.error('Failed to check job access:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleRequestJobAccess = () => {
    setShowAccessDialog(true)
  }

  const handleAccessGranted = async () => {
    console.log('🔄 Access granted - refreshing data...')
    
    // Refresh contractor data to get updated credits
    await fetchContractorData()
    
    // Refresh job access status
    await checkJobAccess()
    
    // Add a small delay to ensure backend has processed the access
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Refresh job data
    console.log('🔄 Refreshing job data...')
    await onJobUpdate(job.id)
    
    console.log('✅ Data refresh completed')
  }

  const handleApplyForJob = async () => {
    if (!hasAccess) {
      toast({
        title: "Access Required",
        description: "You need to purchase job access before applying.",
        variant: "destructive"
      })
      setShowAccessDialog(true)
      return
    }

    // Open application dialog
    setShowApplicationDialog(true)
  }

  const handleApplicationSuccess = async () => {
    // Refresh job data to get updated applications
    await onJobUpdate(job.id)
    await checkJobAccess()
  }

  const handleCompleteJob = async () => {
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
      setUpdating(true)
      console.log(`🔍 Frontend - Calling completeJobWithAmount with jobId: ${job.id}, using budget as finalAmount: ${finalAmount}`)
      await jobsApi.completeJobWithAmount(job.id, Number(finalAmount))
      console.log(`✅ Frontend - completeJobWithAmount call successful`)
      toast({
        title: "Job Marked Complete!",
        description: `Job completed with amount £${finalAmount} (from job budget). Waiting for customer confirmation.`,
      })
      onJobUpdate(job.id)
    } catch (error) {
      console.error(`❌ Frontend - completeJobWithAmount call failed:`, error)
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
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getApplicationStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'PENDING': 'outline',
      'ACCEPTED': 'secondary',
      'REJECTED': 'destructive',
      'none': 'default'
    }
    const labels: Record<string, string> = {
      'PENDING': 'Application Pending',
      'ACCEPTED': 'Application Accepted',
      'REJECTED': 'Application Rejected',
      'none': 'Not Applied'
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  const isJobWinner = job.wonByContractorId === myApplication?.contractorId
  const canCompleteJob = job.status === 'IN_PROGRESS' && isJobWinner
  const canProposeFinalPrice = job.status === 'IN_PROGRESS' && isJobWinner
  const canRequestReview = job.status === 'COMPLETED' && isJobWinner
  const isAwaitingFinalPriceConfirmation = job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION' && isJobWinner

  if (checkingAccess) {
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

  return (
    <div className="container py-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-4">
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

        {/* Credit Balance Display - Only for subscribers */}
        {contractor && subscription && subscription.status === 'active' && (
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

        {/* Access Granted Notice - Show when contractor has access but hasn't applied */}
        {hasAccess && !myApplication && job.status === 'POSTED' && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Access Granted!</h3>
                  <p className="text-green-700">
                    You now have access to this job. View customer contact details below and submit your application.
                  </p>
                </div>
              </div>
              <Button onClick={handleApplyForJob} className="mt-2">
                Apply for This Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Access Required Notice */}
        {!hasAccess && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Job Access Required</h3>
                  <p className="text-orange-700">
                    Purchase access to view customer contact details and apply for this job.
                  </p>
                </div>
              </div>
              <Button onClick={handleRequestJobAccess} className="w-full">
                Purchase Job Access
              </Button>
            </CardContent>
          </Card>
        )}

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
                  <span>{hasAccess ? job.location : `${job.postcode} area`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>
                    Budget: £{job.budget}
                  </span>
                </div>
              </div>
              
              {(hasAccess || myApplication) && job.customer && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Customer Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{job.customer.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{job.customer.user?.email}</span>
                    </div>
                    {job.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{job.customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">
                {hasAccess ? job.description : job.description.substring(0, 200) + '...'}
              </p>
            </div>

            {/* Attachments would be displayed here if supported by the Job type */}
          </CardContent>
        </Card>

        {/* My Application */}
        {myApplication && hasAccess && (
          <Card>
            <CardHeader>
              <CardTitle>Your Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Proposed Rate</h4>
                  <p>£{myApplication.proposedRate}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Timeline</h4>
                  <p>{myApplication.timeline || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cover Letter</h4>
                <p className="text-gray-700">{myApplication.coverLetter}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Applied On</h4>
                <p>{new Date(myApplication.appliedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dispute Section for Contractors */}
        {hasAccess && (['IN_PROGRESS', 'AWAITING_FINAL_PRICE_CONFIRMATION', 'COMPLETED', 'DISPUTED'].includes(job.status)) && (
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
                      If you've completed the work but the customer hasn't confirmed, 
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

        {/* Job Workflow Buttons - Handles Step 2 (Contractor claims "I won") and Step 4 (Enter final price) */}
        <JobWorkflowButtons
          jobId={job.id}
          jobStatus={job.status}
          jobTitle={job.title}
          isContractor={true}
          isCustomer={false}
          isWonByMe={isJobWinner}
          finalAmount={job.finalAmount ? Number(job.finalAmount) : undefined}
          contractorProposedAmount={job.contractorProposedAmount ? Number(job.contractorProposedAmount) : undefined}
          hasApplied={!!myApplication}
          contractorName={undefined}
          onUpdate={() => onJobUpdate(job.id)}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          {hasAccess && !myApplication && job.status === 'POSTED' && (
            <Button onClick={handleApplyForJob} className="flex-1">
              Apply for This Job
            </Button>
          )}

          {canProposeFinalPrice && (
            <Button 
              onClick={() => setShowFinalPriceDialog(true)} 
              className="flex-1"
            >
              Propose Final Price
            </Button>
          )}

          {isAwaitingFinalPriceConfirmation && (
            <div className="flex-1 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
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
              className="flex-1"
            >
              Request Review
            </Button>
          )}
        </div>

        {/* Review Request Dialog */}
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

        {/* Job Access Dialog */}
        <JobLeadAccessDialog
          job={job}
          isOpen={showAccessDialog}
          onClose={() => setShowAccessDialog(false)}
          onAccessGranted={handleAccessGranted}
        />

        {/* Final Price Proposal Dialog */}
        <FinalPriceProposalDialog
          jobId={job.id}
          jobTitle={job.title}
          isOpen={showFinalPriceDialog}
          onClose={() => setShowFinalPriceDialog(false)}
          onSuccess={() => onJobUpdate(job.id)}
        />

        {/* Job Application Dialog */}
        <JobApplicationDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          onSuccess={handleApplicationSuccess}
          jobId={job.id}
          jobTitle={job.title}
          jobBudget={job.budget ? Number(job.budget) : undefined}
        />
      </div>
    </div>
  )
}
