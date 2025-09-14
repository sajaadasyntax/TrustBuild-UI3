"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { jobsApi } from '@/lib/api'

interface FinalPriceProposalDialogProps {
  jobId: string
  jobTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function FinalPriceProposalDialog({ 
  jobId, 
  jobTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: FinalPriceProposalDialogProps) {
  const [finalPrice, setFinalPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid final price amount.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      await jobsApi.proposeFinalPrice(jobId, Number(finalPrice))
      
      toast({
        title: "Final Price Proposed",
        description: "Your final price has been sent to the customer for confirmation.",
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error proposing final price:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to propose final price. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setFinalPrice('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose Final Price</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="final-price">Final Price (£)</Label>
            <Input
              id="final-price"
              type="number"
              step="0.01"
              min="0"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="Enter the final amount for this job"
              required
            />
            <p className="text-sm text-gray-500">
              Enter the actual amount you charged for this completed job.
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The customer will have 7 days to confirm this price. 
              If they don't respond, an admin can override the confirmation.
            </p>
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
              disabled={submitting || !finalPrice}
            >
              {submitting ? "Proposing..." : "Propose Final Price"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
