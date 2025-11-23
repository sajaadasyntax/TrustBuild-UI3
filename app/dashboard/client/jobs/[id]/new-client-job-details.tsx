"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, User, Phone, Mail, Clock, DollarSign, Star, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { jobsApi, paymentsApi, handleApiError, Job, JobApplication } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import WriteReviewDialog from '@/components/reviews/WriteReviewDialog'
import { FinalPriceConfirmationDialog } from "@/components/jobs/FinalPriceConfirmationDialog"
import { CreateDisputeDialog } from '@/components/disputes/CreateDisputeDialog'
import JobWorkflowButtons from '@/components/jobs/JobWorkflowButtons'

interface ClientJobDetailsProps {
  job: Job
  onJobUpdate: () => void
}

export function NewClientJobDetails({ job, onJobUpdate }: ClientJobDetailsProps) {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showFinalPriceConfirmation, setShowFinalPriceConfirmation] = useState(false)

  const fetchApplications = useCallback(async () => {
    try {
      const applicationsData = await jobsApi.getApplications(job.id)
      setApplications(applicationsData)
      
      // Check if there's already a selected contractor
      const winner = applicationsData.find(app => 
        job.wonByContractorId && app.contractorId === job.wonByContractorId
      )
      if (winner) {
        setSelectedContractor(winner.contractorId)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    }
  }, [job.id, job.wonByContractorId])

  useEffect(() => {
    if (job.id) {
      fetchApplications()
    }
  }, [job.id, fetchApplications])

  // Removed handleSelectContractor, confirmContractorSelection, handleChangeContractor, and handleAcceptApplication
  // Customers can only view applications and contractor profiles, not select/accept contractors

  const handleStartWork = async () => {
    if (!selectedContractor) return

    try {
      setUpdating(true)
      await jobsApi.startWork(job.id)
      
      toast({
        title: "Work Started!",
        description: "The contractor can now begin work on your job.",
      })
      
      onJobUpdate()
    } catch (error) {
      handleApiError(error, 'Failed to start work')
    } finally {
      setUpdating(false)
    }
  }

  const handleCompleteJob = async () => {
    try {
      setUpdating(true)
      await jobsApi.confirmJobCompletion(job.id)
      
      toast({
        title: "Job Completed!",
        description: "The job has been marked as complete and payment processed.",
      })
      
      onJobUpdate()
      
      // Show review dialog after successful completion
      setShowReviewDialog(true)
    } catch (error) {
      handleApiError(error, 'Failed to complete job')
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
      'REJECTED': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const selectedApplication = applications.find(app => app.contractorId === selectedContractor)
  const canComplete = job.status === 'IN_PROGRESS' && selectedContractor
  const canConfirmCompletion = job.status === 'COMPLETED' && selectedContractor && !job.customerConfirmed
  const needsFinalPriceConfirmation = job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION' && job.contractorProposedAmount
  const contractorsWithAccess = job.jobAccess?.length || 0

  return (
    <div className="container py-32">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-4">
              {getStatusBadge(job.status)}
              {selectedApplication && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Contractor Selected
                </Badge>
              )}
              {canConfirmCompletion && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="w-4 h-4 mr-1" />
                  Awaiting Your Confirmation
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Job Statistics */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{contractorsWithAccess}</div>
                <div className="text-sm text-gray-500">Contractors Viewed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{applications.length}</div>
                <div className="text-sm text-gray-500">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedContractor ? 1 : 0}
                </div>
                <div className="text-sm text-gray-500">Selected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {job.budget ? formatCurrency(job.budget) : 'Quote'}
                </div>
                <div className="text-sm text-gray-500">Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span>
                    Budget: {job.budget ? formatCurrency(job.budget) : 'Not specified'}
                  </span>
                </div>
              </div>
              
              {selectedApplication && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Selected Contractor</h4>
                    {selectedApplication.contractor?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/contractors/${selectedApplication.contractor.id}`} target="_blank">
                          View Profile & Reviews
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedApplication.contractor?.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedApplication.contractor?.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>Quoted: {formatCurrency(selectedApplication.proposedRate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Attachments would be displayed here if supported by the Job type */}
          </CardContent>
        </Card>

        {/* Contractors with Access */}
        {job.purchasedBy && job.purchasedBy.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contractors with Access ({job.purchasedBy.length})</CardTitle>
              <CardDescription>
                These contractors have purchased access to view your job details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.purchasedBy.map((contractor, index) => (
                <div
                  key={contractor.contractorId || index}
                  className="p-4 border rounded-lg border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {contractor.contractorName}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{contractor.averageRating?.toFixed(1) || 'No rating'}</span>
                        <span className="text-gray-500">
                          ({contractor.reviewCount || 0} reviews)
                        </span>
                        <span className="text-gray-500">
                          • {contractor.jobsCompleted || 0} jobs completed
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Purchased: {new Date(contractor.purchasedAt).toLocaleDateString()}
                      </div>
                      {/* Customer should not see contractor payment amount */}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {(contractor.jobsCompleted || 0) > 0 ? 'Experienced contractor' : 'New to platform'}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* View Profile Button */}
                      {contractor.contractorId && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/contractors/${contractor.contractorId}`} target="_blank">
                            View Profile & Reviews
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className={`p-4 border rounded-lg ${
                    selectedContractor === application.contractorId
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {application.contractor?.user?.name}
                      </h4>
                      <p className="text-gray-600">
                        {application.contractor?.businessName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{application.contractor?.averageRating?.toFixed(1) || 'No rating'}</span>
                        <span className="text-gray-500">
                          ({application.contractor?.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(application.proposedRate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.timeline && `Timeline: ${application.timeline}`}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Cover Letter</h5>
                    <p className="text-gray-700">{application.coverLetter}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* View Profile Button - Always available */}
                      {application.contractor?.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/contractors/${application.contractor.id}`} target="_blank">
                              View Profile & Reviews
                            </Link>
                          </Button>
                        </>
                      )}
                      
                      {/* Show application status */}
                      {application.status === 'ACCEPTED' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Application Accepted
                        </Badge>
                      )}
                      
                      {selectedContractor === application.contractorId ? (
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Selected Contractor
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No Applications */}
        {applications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600">
                Contractors who purchase access to your job will be able to submit applications.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Final Price Confirmation Notice */}
        {needsFinalPriceConfirmation && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Final Price Confirmation Required</h3>
                  <p className="text-yellow-700">
                    The contractor has proposed a final price of £{job.contractorProposedAmount?.toFixed(2)} for this job.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-yellow-600">
                  <p>Proposed on: {job.finalPriceProposedAt ? new Date(job.finalPriceProposedAt).toLocaleDateString() : 'Unknown'}</p>
                  <p>Response deadline: {job.finalPriceTimeoutAt ? new Date(job.finalPriceTimeoutAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <Button 
                  onClick={() => setShowFinalPriceConfirmation(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Review & Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dispute Section */}
        {(['IN_PROGRESS', 'AWAITING_FINAL_PRICE_CONFIRMATION', 'COMPLETED', 'DISPUTED'].includes(job.status)) && job.wonByContractorId && (
          <Card className="border-muted">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                Having issues with this job?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you&apos;re experiencing problems with work quality, delays, communication, or other issues, 
                you can open a dispute and our support team will help resolve it.
              </p>
              <div className="flex gap-3">
                <CreateDisputeDialog 
                  jobId={job.id} 
                  jobTitle={job.title}
                />
                <Button variant="outline" asChild>
                  <Link href="/dashboard/client/disputes">
                    View My Disputes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Workflow Buttons - Handles Step 3 (Customer confirms winner) and Step 5 (Customer confirms price) */}
        <JobWorkflowButtons
          jobId={job.id}
          jobStatus={job.status}
          jobTitle={job.title}
          isContractor={false}
          isCustomer={true}
          isWonByMe={false}
          finalAmount={job.finalAmount ? Number(job.finalAmount) : undefined}
          contractorProposedAmount={job.contractorProposedAmount ? Number(job.contractorProposedAmount) : undefined}
          hasApplied={false}
          contractorName={job.wonByContractor?.user?.name || job.wonByContractor?.businessName || undefined}
          onUpdate={onJobUpdate}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          {selectedContractor && job.status === 'POSTED' && (
            <Button onClick={handleStartWork} disabled={updating} className="flex-1">
              {updating ? 'Starting...' : 'Start Work with Selected Contractor'}
            </Button>
          )}
          
          {canComplete && (
            <Button onClick={handleCompleteJob} disabled={updating} className="flex-1">
              {updating ? 'Processing...' : 'Complete Job & Pay Contractor'}
            </Button>
          )}
          
          {canConfirmCompletion && (
            <Button onClick={handleCompleteJob} disabled={updating} className="flex-1 bg-green-600 hover:bg-green-700">
              {updating ? 'Processing...' : 'Confirm Job Completion & Amount'}
            </Button>
          )}
          
          {job.status === 'COMPLETED' && job.customerConfirmed && (
            <div className="flex items-center justify-between gap-4 text-green-600 bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Job completed and confirmed! Payment processed.</span>
              </div>
              {job.wonByContractorId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewDialog(true)}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Review Dialog */}
        {job.wonByContractorId && (
          <WriteReviewDialog
            isOpen={showReviewDialog}
            onClose={() => setShowReviewDialog(false)}
            onSuccess={() => {
              setShowReviewDialog(false)
              onJobUpdate()
            }}
            jobId={job.id}
            contractorId={job.wonByContractorId}
            contractorName={job.wonByContractor?.user?.name || 'Contractor'}
            jobTitle={job.title}
          />
        )}

        {/* Final Price Confirmation Dialog */}
        {needsFinalPriceConfirmation && job.contractorProposedAmount && job.finalPriceProposedAt && job.finalPriceTimeoutAt && (
          <FinalPriceConfirmationDialog
            jobId={job.id}
            jobTitle={job.title}
            contractorName={job.wonByContractor?.user?.name || 'Contractor'}
            proposedAmount={job.contractorProposedAmount}
            proposedAt={job.finalPriceProposedAt}
            timeoutAt={job.finalPriceTimeoutAt}
            isOpen={showFinalPriceConfirmation}
            onClose={() => setShowFinalPriceConfirmation(false)}
            onSuccess={() => onJobUpdate()}
          />
        )}
      </div>
    </div>
  )
}
