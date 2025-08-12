"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
  Send,
  Lock
} from 'lucide-react'
import { jobsApi, handleApiError, Job } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import JobLeadAccessDialog from '@/components/JobLeadAccessDialog'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [application, setApplication] = useState({
    proposal: '',
    estimatedCost: '',
    timeline: '',
    questions: ''
  })

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

  const handleAccessGranted = async () => {
    setHasAccess(true)
    setShowAccessDialog(false)
    // Refresh job data to get full details
    if (job) {
      await fetchJob(job.id)
    }
  }

  const handleApply = async () => {
    if (!job || !user) return

    // Check if contractor has access
    if (!hasAccess) {
      setShowAccessDialog(true)
      return
    }

    // For quote-on-request jobs, ensure quote is provided
    if (!job.budget && !application.estimatedCost) {
      toast({
        title: "Quote Required",
        description: "Please provide your quote for this project.",
        variant: "destructive"
      })
      return
    }

    if (!application.estimatedCost || parseFloat(application.estimatedCost) <= 0) {
      toast({
        title: "Invalid Quote",
        description: "Please provide a valid quote amount.",
        variant: "destructive"
      })
      return
    }

    try {
      setApplying(true)
      await jobsApi.apply(job.id, {
        proposal: application.proposal,
        estimatedCost: parseInt(application.estimatedCost),
        timeline: application.timeline,
        questions: application.questions
      })
      
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the customer.",
      })
      
      setShowApplicationForm(false)
      await fetchJob(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to submit application')
    } finally {
      setApplying(false)
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

  const canApply = () => {
    if (!job || !user) return false
    if (user.role !== 'CONTRACTOR') return false
    if (job.status !== 'POSTED' && job.status !== 'DRAFT') return false
    
    const hasApplied = job.applications?.some(app => 
      app.contractor?.userId === user.id
    )
    
    return !hasApplied
  }

  const canAcceptDirectly = () => {
    if (!job || !user) return false
    if (user.role !== 'CONTRACTOR') return false
    if (job.status !== 'POSTED') return false
    
    // Check if job already has accepted applications
    const hasAcceptedApplication = job.applications?.some(app => app.status === 'ACCEPTED')
    if (hasAcceptedApplication) return false
    
    // Check if contractor has already applied
    const hasApplied = job.applications?.some(app => 
      app.contractor?.userId === user.id
    )
    
    return !hasApplied
  }

  const handleQuickAccept = async () => {
    if (!job || !user) return

    // Check if contractor has access
    if (!hasAccess) {
      setShowAccessDialog(true)
      return
    }

    // For quote-on-request jobs, redirect to application form
    if (!job.budget) {
      setShowApplicationForm(true)
      toast({
        title: "Quote Required",
        description: "Please provide your quote to accept this job.",
      })
      return
    }

    try {
      setApplying(true)
      await jobsApi.acceptDirectly(job.id, {
        proposal: 'Quick job acceptance - ready to start immediately',
        estimatedCost: job.budget || 0,
        timeline: job.urgency || 'As discussed'
      })
      
      toast({
        title: "Job accepted!",
        description: "You have successfully accepted this job and it's now in progress.",
      })
      
      await fetchJob(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to accept job')
    } finally {
      setApplying(false)
    }
  }

  // Helper function to check if job is quote-on-request
  const isQuoteOnRequest = () => {
    return !job?.budget || job.budget === 0
  }

  // Helper function to show restricted content for contractors without access
  const showRestrictedContent = () => {
    return user?.role === 'CONTRACTOR' && !hasAccess && !checkingAccess
  }

  // Show loading if data is loading OR if contractor access check is in progress
  if (loading || (user?.role === 'CONTRACTOR' && checkingAccess)) {
    return (
      <div className="container py-32">
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
      <div className="container py-32">
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
    <div className="container py-32">
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
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {showRestrictedContent() 
                    ? (job.postcode ? `${job.postcode} area` : 'Area details available after purchase')
                    : job.location
                  }
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.budget ? formatBudget(job.budget) : 'Quote on request'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {job.isUrgent && (
                <Badge className="bg-red-100 text-red-800">
                  Urgent
                </Badge>
              )}
              <Badge className={getStatusColor(job.status)}>
                {job.status.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                {showRestrictedContent() ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Access Required</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Pay the access fee to view the full job description and customer contact details.
                      </p>
                      <Button onClick={() => setShowAccessDialog(true)} size="sm">
                        View Access Options
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Description:</strong> {job.description.substring(0, 300)}...
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Location:</strong> {job.postcode ? `${job.postcode} area` : 'Location details available after purchase'}
                    </div>
                    {job.customer && job.customer.user && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Customer Name:</strong> {job.customer.user.name}
                      </div>
                    )}
                    {job.customer && job.customer.city && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Customer City:</strong> {job.customer.city}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {job.description}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Service Type</Label>
                    <p className="text-muted-foreground">{job.service?.name || 'General'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Budget</Label>
                    <p className="text-muted-foreground">{job.budget ? formatBudget(job.budget) : 'Quote on request'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-muted-foreground">
                      {showRestrictedContent() 
                        ? (job.postcode ? `${job.postcode} area` : 'Area details available after purchase')
                        : job.location
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timeline</Label>
                    <p className="text-muted-foreground">{job.urgency || 'Flexible'}</p>
                  </div>
                  {showRestrictedContent() ? (
                    <div className="col-span-2">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Lock className="h-3 w-3" />
                          <span>Contact details available after purchase</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    job.postcode && (
                      <div>
                        <Label className="text-sm font-medium">Postcode</Label>
                        <p className="text-muted-foreground">{job.postcode}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {canAcceptDirectly() && job.budget && (
              <Card>
                <CardHeader>
                  <CardTitle>Accept this Job</CardTitle>
                  <CardDescription>
                    This job is available for immediate acceptance at the posted budget.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {showRestrictedContent() ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                          <Lock className="h-4 w-4" />
                          Access Required
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          Pay the access fee to view customer details and apply for this job.
                        </p>
                        <Button 
                          onClick={() => setShowAccessDialog(true)}
                          size="sm"
                        >
                          Pay Access Fee
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                            <CheckCircle className="h-4 w-4" />
                            Quick Accept Available
                          </div>
                          <p className="text-sm text-green-700">
                            This job has no applications yet. You can accept it directly and start working immediately 
                            for the posted budget of {formatBudget(job.budget)}.
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleQuickAccept}
                            disabled={applying}
                            className="flex-1"
                          >
                            {applying ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Job ({formatBudget(job.budget)})
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowApplicationForm(true)}
                            disabled={applying}
                          >
                            Apply with Custom Quote
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {canAcceptDirectly() && isQuoteOnRequest() && (
              <Card>
                <CardHeader>
                  <CardTitle>Quote Required</CardTitle>
                  <CardDescription>
                    This is a quote-on-request job. You must provide your quote to apply.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {showRestrictedContent() ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                          <Lock className="h-4 w-4" />
                          Access Required
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          Pay the access fee to view customer details and submit your quote.
                        </p>
                        <Button 
                          onClick={() => setShowAccessDialog(true)}
                          size="sm"
                        >
                          Pay Access Fee
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                            <AlertCircle className="h-4 w-4" />
                            Quote Required
                          </div>
                          <p className="text-sm text-blue-700">
                            The customer has not specified a budget. Please provide your quote for this project when applying.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={() => setShowApplicationForm(true)}
                          disabled={applying}
                          className="w-full"
                        >
                          Provide Quote & Apply
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {canApply() && !canAcceptDirectly() && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                  <CardDescription>
                    {isQuoteOnRequest() 
                      ? "This is a quote-on-request job. Please provide your quote when applying."
                      : "Submit your application to be considered for this project."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showRestrictedContent() ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                        <Lock className="h-4 w-4" />
                        Access Required
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Pay the access fee to view customer details and apply for this job.
                      </p>
                      <Button 
                        onClick={() => setShowAccessDialog(true)}
                        size="sm"
                      >
                        Pay Access Fee
                      </Button>
                    </div>
                  ) : !showApplicationForm ? (
                    <Button onClick={() => setShowApplicationForm(true)}>
                      {isQuoteOnRequest() ? "Provide Quote & Apply" : "Apply Now"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="proposal">Cover Letter / Proposal</Label>
                        <Textarea
                          id="proposal"
                          placeholder="Tell the customer why you're the right person for this job..."
                          value={application.proposal}
                          onChange={(e) => setApplication(prev => ({ ...prev, proposal: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cost" className="flex items-center gap-1">
                            Your Quote (£) 
                            {isQuoteOnRequest() && <span className="text-red-500">*</span>}
                          </Label>
                          {isQuoteOnRequest() && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Required: Customer is requesting quotes for this project
                            </p>
                          )}
                          <Input
                            id="cost"
                            type="number"
                            placeholder={isQuoteOnRequest() ? "Enter your quote (required)" : "Enter your quote"}
                            value={application.estimatedCost}
                            onChange={(e) => setApplication(prev => ({ ...prev, estimatedCost: e.target.value }))}
                            required={isQuoteOnRequest()}
                            className={isQuoteOnRequest() && !application.estimatedCost ? "border-red-300" : ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeline">Your Timeline</Label>
                          <Input
                            id="timeline"
                            placeholder="e.g., 2-3 weeks"
                            value={application.timeline}
                            onChange={(e) => setApplication(prev => ({ ...prev, timeline: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="questions">Questions for Customer (Optional)</Label>
                        <Textarea
                          id="questions"
                          placeholder="Any questions about the project?"
                          value={application.questions}
                          onChange={(e) => setApplication(prev => ({ ...prev, questions: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleApply} 
                          disabled={applying || !application.proposal || (isQuoteOnRequest() && !application.estimatedCost)}
                        >
                          {applying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Submit Application
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowApplicationForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                          try {
                            await jobsApi.updateStatus(job.id, 'COMPLETED')
                            toast({
                              title: "Job completed!",
                              description: "The job has been marked as completed.",
                            })
                            await fetchJob(job.id)
                          } catch (error) {
                            handleApiError(error, 'Failed to update job status')
                          }
                        }}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    {job.status === 'POSTED' && (
                      <Button 
                        onClick={async () => {
                          try {
                            await jobsApi.updateStatus(job.id, 'IN_PROGRESS')
                            toast({
                              title: "Job started!",
                              description: "The job has been marked as in progress.",
                            })
                            await fetchJob(job.id)
                          } catch (error) {
                            handleApiError(error, 'Failed to update job status')
                          }
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        Start Working
                      </Button>
                    )}

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
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Lock className="h-4 w-4" />
                      <span className="font-medium">Customer Details Locked</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Pay the access fee to view customer information and contact details.
                    </p>
                    {job.customer && job.customer.user && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Name:</strong> {job.customer.user.name}
                      </div>
                    )}
                    {job.customer && job.customer.city && (
                      <div className="text-sm text-muted-foreground">
                        <strong>City:</strong> {job.customer.city}
                      </div>
                    )}
                    <Button 
                      onClick={() => setShowAccessDialog(true)}
                      size="sm"
                    >
                      Unlock Customer Details
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4">
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Applications</span>
                    <span className="font-medium">{job.applications?.length || 0}</span>
                  </div>
                  
                  {!canApply() && !canAcceptDirectly() && user?.role === 'CONTRACTOR' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {job.applications?.some(app => app.contractor?.userId === user.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          You have already applied
                        </>
                      ) : job.applications?.some(app => app.status === 'ACCEPTED') ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          This job has been accepted by another contractor
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          This job is no longer accepting applications
                        </>
                      )}
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
             requiresQuote: !job.budget || job.budget === 0,
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
