"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Clock, User, MapPin, DollarSign, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { adminApi } from '@/lib/adminApi'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface Job {
  id: string
  title: string
  description: string
  budget: string
  location: string
  status: string
  contractorProposedAmount: number
  finalPriceProposedAt: string
  finalPriceTimeoutAt?: string
  contractor: {
    businessName: string
  }
  customer: {
    user: {
      name: string
    }
  }
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error)
  toast({
    title: "Error",
    description: error.message || defaultMessage,
    variant: "destructive",
  })
}

export default function FinalPriceConfirmationsPage() {
  const { loading: authLoading } = useAdminAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Wait for authentication to be ready before fetching data
    if (!authLoading) {
      fetchJobs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getJobsAwaitingFinalPriceConfirmation()
      setJobs(response.data as Job[])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      handleApiError(error, 'Failed to load jobs awaiting final price confirmation')
    } finally {
      setLoading(false)
    }
  }

  const handleOverride = async () => {
    if (!selectedJob || !overrideReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for overriding the final price confirmation.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)
      await adminApi.adminOverrideFinalPrice(selectedJob.id, 0, overrideReason)
      
      toast({
        title: "Final Price Overridden",
        description: "The final price has been confirmed and the job is now completed.",
      })
      
      setShowOverrideDialog(false)
      setOverrideReason('')
      setSelectedJob(null)
      fetchJobs()
    } catch (error) {
      console.error('Failed to override final price:', error)
      handleApiError(error, 'Failed to override final price confirmation')
    } finally {
      setProcessing(false)
    }
  }

  const getTimeRemaining = (timeoutAt: string) => {
    const now = new Date()
    const timeout = new Date(timeoutAt)
    const diff = timeout.getTime() - now.getTime()
    
    if (diff <= 0) return { text: "Expired", variant: "destructive" as const }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return { text: `${days} day${days > 1 ? 's' : ''} remaining`, variant: "default" as const }
    return { text: `${hours} hour${hours > 1 ? 's' : ''} remaining`, variant: "secondary" as const }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Final Price Confirmations</h1>
            <p className="text-gray-600 mt-2">
              Jobs awaiting customer confirmation of final prices
            </p>
          </div>
          <Button onClick={fetchJobs} variant="outline">
            Refresh
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Awaiting Confirmation</h3>
              <p className="text-gray-500">
                There are currently no jobs waiting for final price confirmation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const timeRemaining = getTimeRemaining(job.finalPriceTimeoutAt!)
              
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      <Badge variant={timeRemaining.variant}>
                        {timeRemaining.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{job.contractor?.businessName || 'Unknown Contractor'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(job.contractorProposedAmount!)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Proposed: {new Date(job.finalPriceProposedAt!).toLocaleDateString()}</p>
                      <p>Deadline: {new Date(job.finalPriceTimeoutAt!).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => {
                          setSelectedJob(job)
                          setShowOverrideDialog(true)
                        }}
                        className="w-full"
                        variant="outline"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Override Confirmation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Override Dialog */}
        <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Override Final Price Confirmation</DialogTitle>
            </DialogHeader>
            
            {selectedJob && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{selectedJob.title}</h4>
                  <p className="text-sm text-gray-600">
                    Contractor: {selectedJob.contractor?.businessName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Proposed Amount: {formatCurrency(selectedJob.contractorProposedAmount!)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="override-reason" className="text-sm font-medium">
                    Reason for Override
                  </label>
                  <Textarea
                    id="override-reason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Explain why you're overriding the customer confirmation..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowOverrideDialog(false)
                  setOverrideReason('')
                  setSelectedJob(null)
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleOverride}
                disabled={processing || !overrideReason.trim()}
                variant="destructive"
              >
                {processing ? 'Processing...' : 'Override Confirmation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
