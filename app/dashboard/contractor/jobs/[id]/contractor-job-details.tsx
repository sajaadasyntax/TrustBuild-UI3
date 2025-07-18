"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Calendar, Clock, User, Star, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Job, jobsApi, handleApiError } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export function ContractorJobDetails({ job, onJobUpdate }: { job: Job; onJobUpdate: (jobId: string) => void }) {
  const [updating, setUpdating] = useState(false)

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

              {job.status === 'POSTED' && (
                <Button 
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  className="w-full"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Start Working'}
                </Button>
              )}

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