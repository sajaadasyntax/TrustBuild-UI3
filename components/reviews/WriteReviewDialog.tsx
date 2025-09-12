'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { reviewsApi, handleApiError } from '@/lib/api'

interface WriteReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  jobId: string
  contractorId: string
  contractorName: string
  jobTitle: string
}

export default function WriteReviewDialog({
  isOpen,
  onClose,
  onSuccess,
  jobId,
  contractorId,
  contractorName,
  jobTitle
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating for this contractor.",
        variant: "destructive"
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment about your experience.",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      await reviewsApi.create({
        jobId,
        contractorId,
        rating,
        comment: comment.trim()
      })

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review has been submitted.",
      })

      // Reset form
      setRating(0)
      setComment('')
      onSuccess()
      onClose()
    } catch (error) {
      handleApiError(error, 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setRating(0)
      setComment('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Job</Label>
              <p className="text-sm text-muted-foreground">{jobTitle}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Contractor</Label>
              <p className="text-sm text-muted-foreground">{contractorName}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-sm font-medium">
                Rating *
              </Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    disabled={submitting}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-medium">
                Your Review *
              </Label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience with this contractor..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                disabled={submitting}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {comment.length}/500 characters
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
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
              disabled={submitting || rating === 0 || !comment.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
