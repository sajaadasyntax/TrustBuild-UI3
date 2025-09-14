"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { jobsApi } from '@/lib/api'

interface FinalPriceConfirmationDialogProps {
  jobId: string
  jobTitle: string
  contractorName: string
  proposedAmount: number
  proposedAt: string
  timeoutAt: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function FinalPriceConfirmationDialog({ 
  jobId, 
  jobTitle, 
  contractorName,
  proposedAmount,
  proposedAt,
  timeoutAt,
  isOpen, 
  onClose, 
  onSuccess 
}: FinalPriceConfirmationDialogProps) {
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!action) {
      toast({
        title: "Select Action",
        description: "Please choose to confirm or reject the final price.",
        variant: "destructive",
      })
      return
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejecting the final price.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      await jobsApi.confirmFinalPrice(
        jobId, 
        action, 
        action === 'reject' ? rejectionReason : undefined
      )
      
      toast({
        title: action === 'confirm' ? "Final Price Confirmed" : "Final Price Rejected",
        description: action === 'confirm' 
          ? "The final price has been confirmed and the job is now completed."
          : "The final price has been rejected and the contractor can propose a new amount.",
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error confirming final price:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to process final price confirmation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setAction(null)
      setRejectionReason('')
      onClose()
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const timeout = new Date(timeoutAt)
    const diff = timeout.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''} remaining`
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Final Price</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{jobTitle}</h3>
                  <p className="text-sm text-gray-500">Contractor: {contractorName}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Proposed Final Price</p>
                    <p className="text-2xl font-bold text-green-600">£{proposedAmount.toFixed(2)}</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining()}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Proposed on: {new Date(proposedAt).toLocaleDateString()}</p>
                  <p>Response deadline: {new Date(timeoutAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="font-medium">What would you like to do?</p>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="action"
                    value="confirm"
                    checked={action === 'confirm'}
                    onChange={(e) => setAction(e.target.value as 'confirm')}
                    className="text-green-600"
                  />
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Confirm this final price</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as 'reject')}
                    className="text-red-600"
                  />
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Reject this final price</span>
                  </div>
                </label>
              </div>
            </div>
            
            {action === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Reason for rejection (required)</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why you're rejecting this final price..."
                  rows={3}
                  required
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !action}
              variant={action === 'confirm' ? 'default' : 'destructive'}
            >
              {submitting 
                ? "Processing..." 
                : action === 'confirm' 
                  ? "Confirm Final Price" 
                  : "Reject Final Price"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
