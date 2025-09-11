"use client"

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, User, Phone, Mail, Clock, DollarSign, Star, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { jobsApi, paymentsApi, handleApiError, Job, JobApplication } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ClientJobDetailsProps {
  job: Job
  onJobUpdate: () => void
}

export function NewClientJobDetails({ job, onJobUpdate }: ClientJobDetailsProps) {
  const { user } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [showSelectionDialog, setShowSelectionDialog] = useState(false)
  const [contractorToSelect, setContractorToSelect] = useState<JobApplication | null>(null)

  useEffect(() => {
    if (job.id) {
      fetchApplications()
    }
  }, [job.id])

  const fetchApplications = async () => {
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
  }

  const handleSelectContractor = (application: JobApplication) => {
    setContractorToSelect(application)
    setShowSelectionDialog(true)
  }

  const confirmContractorSelection = async () => {
    if (!contractorToSelect) return

    try {
      setUpdating(true)
      await jobsApi.selectContractor(job.id, contractorToSelect.contractorId)
      
      toast({
        title: "Contractor Selected!",
        description: `${contractorToSelect.contractor?.user?.name} has been selected for this job.`,
      })
      
      setSelectedContractor(contractorToSelect.contractorId)
      setShowSelectionDialog(false)
      setContractorToSelect(null)
      onJobUpdate()
    } catch (error) {
      handleApiError(error, 'Failed to select contractor')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangeContractor = (application: JobApplication) => {
    setContractorToSelect(application)
    setShowSelectionDialog(true)
  }

  const handleAcceptApplication = async (application: JobApplication) => {
    try {
      setUpdating(true)
      await jobsApi.acceptApplication(job.id, application.id)
      
      toast({
        title: "Application Accepted!",
        description: `${application.contractor?.user?.name}'s application has been accepted. You can now select them as your contractor.`,
      })
      
      // Refresh applications
      await fetchApplications()
    } catch (error) {
      handleApiError(error, 'Failed to accept application')
    } finally {
      setUpdating(false)
    }
  }

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
                    Budget: {job.budget ? formatCurrency(job.budget) : 'Quote on request'}
                  </span>
                </div>
              </div>
              
              {selectedApplication && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Selected Contractor</h4>
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
                          {job.status === 'POSTED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeContractor(application)}
                            >
                              Change Selection
                            </Button>
                          )}
                        </div>
                      ) : job.status === 'POSTED' && !selectedContractor ? (
                        <div className="flex gap-2">
                          {application.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptApplication(application)}
                            >
                              Accept Application
                            </Button>
                          )}
                          <Button
                            onClick={() => handleSelectContractor(application)}
                            size="sm"
                          >
                            Select This Contractor
                          </Button>
                        </div>
                      ) : job.status === 'POSTED' && selectedContractor ? (
                        <Button
                          variant="outline"
                          onClick={() => handleChangeContractor(application)}
                          size="sm"
                        >
                          Change to This Contractor
                        </Button>
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
        </div>

        {/* Selection Confirmation Dialog */}
        <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedContractor ? 'Change Contractor Selection' : 'Select Contractor'}
              </DialogTitle>
            </DialogHeader>
            
            {contractorToSelect && (
              <div className="py-4">
                <p className="mb-4">
                  {selectedContractor 
                    ? `Change your selection to ${contractorToSelect.contractor?.user?.name}?`
                    : `Select ${contractorToSelect.contractor?.user?.name} for this job?`
                  }
                </p>
                
                <div className="space-y-2">
                  <div><strong>Contractor:</strong> {contractorToSelect.contractor?.user?.name}</div>
                  <div><strong>Business:</strong> {contractorToSelect.contractor?.businessName}</div>
                  <div><strong>Proposed Rate:</strong> {formatCurrency(contractorToSelect.proposedRate)}</div>
                  <div><strong>Timeline:</strong> {contractorToSelect.timeline || 'Not specified'}</div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSelectionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmContractorSelection}
                disabled={updating}
              >
                {updating ? 'Selecting...' : 'Confirm Selection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
