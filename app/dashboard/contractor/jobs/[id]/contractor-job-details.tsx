"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock, User, Star, MessageSquare, CheckCircle2, AlertCircle, Phone, Mail, Trophy, DollarSign } from "lucide-react"
import { useState } from "react"
import { Job, jobsApi, handleApiError } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export function ContractorJobDetails({ job, onJobUpdate }: { job: Job; onJobUpdate: (jobId: string) => void }) {
  const [updating, setUpdating] = useState(false)
  const [finalAmount, setFinalAmount] = useState('')

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdating(true)
      await jobsApi.updateStatus(job.id, newStatus)
      toast({
        title: "Status updated!",
        description: `Job status has been updated to ${newStatus.toLowerCase().replace('_', ' ')}.`,
      })
      onJobUpdate(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to update job status')
    } finally {
      setUpdating(false)
    }
  }

  const handleExpressInterest = async () => {
    try {
      setUpdating(true)
      await jobsApi.expressInterest(job.id)
      toast({
        title: "Interest Expressed!",
        description: "You have expressed interest in this job. The customer will review and may select you.",
      })
      onJobUpdate(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to express interest')
    } finally {
      setUpdating(false)
    }
  }

  const handleCompleteWithAmount = async () => {
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid final amount.",
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true)
      await jobsApi.completeJobWithAmount(job.id, parseFloat(finalAmount))
      toast({
        title: "Job Completed!",
        description: "Job marked as completed. Waiting for customer confirmation.",
      })
      onJobUpdate(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to complete job')
    } finally {
      setUpdating(false)
    }
  }

  const handleRequestReview = async () => {
    try {
      setUpdating(true)
      await jobsApi.requestReview(job.id)
      toast({
        title: "Review Requested!",
        description: "Review request sent to customer.",
      })
      onJobUpdate(job.id)
    } catch (error) {
      handleApiError(error, 'Failed to request review')
    } finally {
      setUpdating(false)
    }
  }

  // Removed handleMarkJobAsWon function - contractors can no longer mark jobs as won

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">Job Details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor/current-jobs">
            Back to Current Jobs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Project Details</CardTitle>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Created on {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Timeline: {job.urgency || 'Flexible'}</span>
              </div>
              <p className="text-sm">{job.description}</p>
            </CardContent>
          </Card>

          {/* Job Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Job Status Management</CardTitle>
              <CardDescription>Update the status of this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Status</label>
                <p className="text-lg font-medium">
                  <Badge variant={job.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                    {job.status.toLowerCase().replace('_', ' ')}
                  </Badge>
                </p>
              </div>

              {/* Removed: Contractors cannot start work without customer confirmation
                   The customer must use the "Confirm & Allow Work to Start" button */}

              {job.status === 'IN_PROGRESS' && (
                <Button 
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="w-full"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Mark as Completed'}
                </Button>
              )}

              {job.status === 'COMPLETED' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  This job has been completed
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones Section */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(job.milestones || []).map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-4">
                    <div className="mt-1">
                      {milestone.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : milestone.status === "IN_PROGRESS" ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          {milestone.status === "COMPLETED" && milestone.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed on {milestone.completedAt}
                            </p>
                          )}
                          {milestone.status === "PENDING" && milestone.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              Due by {milestone.dueDate}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          milestone.status === "COMPLETED" ? "default" :
                          milestone.status === "IN_PROGRESS" ? "secondary" :
                          "outline"
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Actions for Posted Jobs */}
          {job.hasAccess && !job.wonByContractorId && job.status === 'POSTED' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Job Actions
                </CardTitle>
                <CardDescription>
                  Take action on this job opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleExpressInterest} 
                  disabled={updating}
                  variant="outline"
                  className="w-full"
                >
                  {updating ? "Sending..." : "Express Interest"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Let the customer know you&apos;re interested and wait for their selection.
                </p>
                
                {/* Removed the "Won the Job" button to prevent contractors from auto-selecting themselves */}
              </CardContent>
            </Card>
          )}

          {/* Waiting for Customer Confirmation */}
          {job.wonByContractorId && job.status === 'POSTED' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Awaiting Customer Confirmation
                </CardTitle>
                <CardDescription>
                  You have been selected for this job. Waiting for customer confirmation to start work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Selected - Awaiting Start Approval</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Great news! You&apos;ve been selected for this job. The customer needs to confirm that you can start working on their project. You&apos;ll be notified once they approve and you can begin work.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Completion Workflow */}
          {job.wonByContractorId && job.status === 'IN_PROGRESS' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Complete Job
                </CardTitle>
                <CardDescription>
                  Enter the final amount and mark job as completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="finalAmount">Final Amount (£)</Label>
                  <Input
                    id="finalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter final amount"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCompleteWithAmount} 
                  disabled={updating || !finalAmount}
                  className="w-full"
                >
                  {updating ? "Completing..." : "Complete Job"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Awaiting Customer Confirmation */}
          {job.status === 'COMPLETED' && job.finalAmount && !job.customerConfirmed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Awaiting Confirmation
                </CardTitle>
                <CardDescription>
                  Waiting for customer to confirm completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Final amount: £{job.finalAmount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The customer will confirm the work is completed and the amount is correct.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Request Review */}
          {job.customerConfirmed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Request Review
                </CardTitle>
                <CardDescription>
                  Ask the customer to leave a review for your work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-green-200 bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Job Completed Successfully</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Final amount: £{job.finalAmount} • Confirmed by customer
                    </p>
                    {job.commissionPaid && (
                      <p className="text-xs text-green-600 mt-1">
                        Commission (5%) has been charged
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleRequestReview} 
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? "Sending..." : "Request Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{job.budget}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{job.customer.user.name}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                  <span>Customer</span>
                </div>
              </div>
              
              {/* Contact Information */}
              {job.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${job.customer.phone}`} className="text-sm text-blue-600 hover:underline">
                    {job.customer.phone}
                  </a>
                </div>
              )}
              
              {job.customer.user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${job.customer.user.email}`} className="text-sm text-blue-600 hover:underline">
                    {job.customer.user.email}
                  </a>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Customer
              </p>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(job.customer.createdAt).toLocaleDateString()}
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 