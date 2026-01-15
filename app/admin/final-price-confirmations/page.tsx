"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Clock, User, MapPin, DollarSign, AlertTriangle, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  finalPriceRejectedAt?: string
  finalPriceRejectionReason?: string
  contractor?: {
    businessName: string
  }
  wonByContractor?: {
    businessName: string
    user?: {
      name: string
      email: string
    }
  }
  customer: {
    user: {
      name: string
      email?: string
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

// Helper function to check admin permissions
function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

export default function FinalPriceConfirmationsPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const permissions = admin?.permissions || []
  
  // Route guard - check if admin has access to final price confirmations
  useEffect(() => {
    if (!authLoading && admin) {
      const canAccessFinalPrice = isSuperAdmin || hasAnyPermission(permissions, ['final_price:read', 'final_price:write'])
      if (!canAccessFinalPrice) {
        router.push('/admin')
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the Final Price Confirmations page.",
          variant: "destructive",
        })
      }
    }
  }, [admin, authLoading, isSuperAdmin, permissions, router])
  
  // Don't render if no access
  if (!authLoading && admin) {
    const canAccessFinalPrice = isSuperAdmin || hasAnyPermission(permissions, ['final_price:read', 'final_price:write'])
    if (!canAccessFinalPrice) {
      return null
    }
  }
  const [jobs, setJobs] = useState<Job[]>([])
  const [rejectedJobs, setRejectedJobs] = useState<Job[]>([])
  const [activeTab, setActiveTab] = useState<'awaiting' | 'rejected'>('awaiting')
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
      const [awaitingResponse, rejectedResponse] = await Promise.all([
        adminApi.getJobsAwaitingFinalPriceConfirmation(),
        adminApi.getJobsWithRejectedFinalPrice()
      ])
      setJobs(awaitingResponse.data as Job[])
      setRejectedJobs(rejectedResponse.data as Job[])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      handleApiError(error, 'Failed to load jobs')
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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'awaiting' | 'rejected')} className="space-y-6">
          <TabsList>
            <TabsTrigger value="awaiting" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Awaiting Confirmation ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Customer Rejected ({rejectedJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Awaiting Confirmation Tab */}
          <TabsContent value="awaiting">
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
                            <span>{job.contractor?.businessName || job.wonByContractor?.businessName || 'Unknown Contractor'}</span>
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
          </TabsContent>

          {/* Rejected Final Prices Tab */}
          <TabsContent value="rejected">
            {rejectedJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Final Prices</h3>
                  <p className="text-gray-500">
                    There are currently no jobs where the customer rejected the final price.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rejectedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow border-red-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                        <Badge variant="destructive">
                          Rejected
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Contractor: {job.wonByContractor?.businessName || job.wonByContractor?.user?.name || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Customer: {job.customer?.user?.name || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-red-600">
                            Proposed: {formatCurrency(job.contractorProposedAmount!)}
                          </span>
                        </div>
                      </div>
                      
                      {job.finalPriceRejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{job.finalPriceRejectionReason}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        {job.finalPriceProposedAt && (
                          <p>Proposed: {new Date(job.finalPriceProposedAt).toLocaleDateString()}</p>
                        )}
                        {job.finalPriceRejectedAt && (
                          <p>Rejected: {new Date(job.finalPriceRejectedAt).toLocaleDateString()}</p>
                        )}
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
                          Admin Override
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
