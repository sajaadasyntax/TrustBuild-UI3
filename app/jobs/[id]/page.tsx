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
      console.log('Job Access Check Result:', accessData) // Debug log
      setHasAccess(accessData.hasAccess)
    } catch (error) {
      console.error('Error checking job access:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
      setLoading(false) // Now safe to show content
    }
  }

  const handleAccessGranted = async (customerContactData?: any) => {
    setHasAccess(true)
    setShowAccessDialog(false)
    
    // Refresh job data to get full details
    if (job) {
      // Immediately update the job with customer contact details if provided
      if (customerContactData && customerContactData.customerContact) {
        // Create an updated job object with the customer contact details
        const updatedJob = {
          ...job,
          customer: {
            ...job.customer,
            phone: customerContactData.customerContact.phone || job.customer.phone,
            user: {
              ...job.customer.user,
              name: customerContactData.customerContact.name || job.customer.user.name,
              email: customerContactData.customerContact.email || job.customer.user.email
            }
          }
        };
        
        // Update the job state immediately
        setJob(updatedJob);
        
        toast({
          title: "Access Granted",
          description: "Customer contact details are now available.",
        });
      }
      
      // Still fetch the complete job data to ensure everything is up to date
      await fetchJob(job.id)
    }
  }

  const handleApply = async () => {
    console.log('🚀 Starting application submission...', {
      job: job?.id,
      user: user?.id,
      hasAccess,
      application
    });

    if (!job || !user) {
      console.error('❌ Missing job or user');
      return;
    }

    // Check if contractor has access
    if (!hasAccess) {
      console.warn('⚠️ No access to job, showing access dialog');
      setShowAccessDialog(true);
      return;
    }


    if (!application.estimatedCost || parseFloat(application.estimatedCost) <= 0) {
      console.warn('⚠️ Invalid quote amount');
      toast({
        title: "Invalid Quote",
        description: "Please provide a valid quote amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      setApplying(true);
      console.log('📤 Submitting application via API...');
      await jobsApi.apply(job.id, {
        proposal: application.proposal,
        estimatedCost: parseInt(application.estimatedCost),
        timeline: application.timeline,
        questions: application.questions
      });
      
      console.log('✅ Application submitted successfully');
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the customer.",
      });
      
      setShowApplicationForm(false);
      await fetchJob(job.id);
    } catch (error: any) {
      console.error('❌ Application submission failed:', error);
      // Check for access-related errors
      if (error?.response?.status === 403 || error?.message?.includes('access')) {
        toast({
          title: "Access Required",
          description: "You need to purchase job access before applying. Please purchase access first.",
          variant: "destructive"
        });
        setShowApplicationForm(false); // Close the form
        // Optionally refresh access status
        if (job) {
          await checkJobAccess(job.id);
        }
      } else {
        handleApiError(error, 'Failed to submit application');
      }
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

    // Contractors must provide their own estimate, not use customer budget
    // For direct acceptance, prompt contractor to provide their quote
    // This should open a dialog or form for contractor to enter their estimate
    toast({
      title: "Provide Your Quote",
      description: "Please apply for this job with your own quote. You cannot accept jobs without providing your estimated cost.",
      variant: "default"
    })
    return

    // Unreachable code - kept for potential future use
    // job is already checked for null at the start of the function
    try {
      setApplying(true)
      await jobsApi.acceptDirectly(job!.id, {
        proposal: 'Quick job acceptance - ready to start immediately',
        estimatedCost: job!.budget || 0,
        timeline: job!.urgency || 'As discussed'
      })
      
      toast({
        title: "Job accepted!",
        description: "You have successfully accepted this job and it's now in progress.",
      })
      
      await fetchJob(job!.id)
    } catch (error) {
      handleApiError(error, 'Failed to accept job')
    } finally {
      setApplying(false)
    }
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
              <h1 className="text-3xl font-bold mb-2">
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
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
                  <p className="text-muted-foreground whitespace-pre-wrap">
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
                  <div className="grid grid-cols-2 gap-4">
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
                            for the posted budget of {formatBudget(job.budget ?? 0)}.
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
                                Accept Job ({formatBudget(job.budget ?? 0)})
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


            {canApply() && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                  <CardDescription>
                    Submit your application to be considered for this job.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showRestrictedContent() ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                        <Lock className="h-4 w-4" />
                        Access Required to Apply
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        To apply for this job and access the customer&apos;s contact details, you need to purchase job access first. 
                        This allows you to see the full job description, customer contact information, and submit your application.
                      </p>
                      <div className="text-xs text-blue-600 mb-3 p-2 bg-blue-100 rounded">
                        <strong>How it works:</strong><br/>
                        1. Purchase access to this job<br/>
                        2. Get instant access to customer contact details<br/>
                        3. Submit your quote and application<br/>
                        4. Contact the customer directly
                      </div>
                      <Button 
                        onClick={() => setShowAccessDialog(true)}
                        size="sm"
                      >
                        Purchase Job Access
                      </Button>
                    </div>
                                  ) : !showApplicationForm ? (
                    <Button onClick={() => {
                      console.log('📝 Opening application form...');
                      setShowApplicationForm(true);
                    }}>
                      Apply Now
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
                          <Label htmlFor="cost">
                            Your Quote (£) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cost"
                            type="number"
                            placeholder="Enter your quote"
                            value={application.estimatedCost}
                            onChange={(e) => setApplication(prev => ({ ...prev, estimatedCost: e.target.value }))}
                            required
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
                          disabled={applying || !application.proposal || !application.estimatedCost}
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
                            console.log(`🔍 Jobs Page - Calling completeJobWithAmount with jobId: ${job.id}, using budget as finalAmount: ${finalAmount}`)
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
                  
                  {!canApply() && user?.role === 'CONTRACTOR' && (
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
