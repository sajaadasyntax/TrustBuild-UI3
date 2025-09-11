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

  // Get the application for this contractor
  const myApplication = job.applications?.find(app => 
    app.contractor?.userId === user?.id
  )

  useEffect(() => {
    fetchContractorData()
    checkJobAccess()
  }, [job.id])

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
      const accessData = await jobsApi.checkAccess(job.id)
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
    // Refresh contractor data to get updated credits
    await fetchContractorData()
    // Refresh job access status
    await checkJobAccess()
    // Refresh job data
    onJobUpdate(job.id)
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

    // Redirect to application form or handle application logic
    toast({
      title: "Application Started",
      description: "Redirecting to application form...",
    })
  }

  const handleCompleteJob = async () => {
    try {
      setUpdating(true)
      await jobsApi.complete(job.id)
      toast({
        title: "Job Marked Complete!",
        description: "The job has been marked as complete. Waiting for customer confirmation.",
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
  const canRequestReview = job.status === 'COMPLETED' && isJobWinner

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

        {/* Credit Balance Display */}
        {contractor && (
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
                    Budget: {job.budget ? `£${job.budget}` : 'Quote on request'}
                  </span>
                </div>
              </div>
              
              {hasAccess && job.customer && (
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          {hasAccess && !myApplication && job.status === 'POSTED' && (
            <Button onClick={handleApplyForJob} className="flex-1">
              Apply for This Job
            </Button>
          )}

          {canCompleteJob && (
            <Button onClick={handleCompleteJob} disabled={updating} className="flex-1">
              {updating ? 'Updating...' : 'Mark Job Complete'}
            </Button>
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
      </div>
    </div>
  )
}
