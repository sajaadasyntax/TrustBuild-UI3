"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Calendar, Building2, MessageSquare, Star, CheckCircle2, PenTool, User } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { reviewsApi, handleApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED"
  description: string
  location: string
  postedAt: string
  startedAt?: string
  completedAt?: string
  contractor?: {
    id: string
    name: string
    businessName?: string
    rating: number
    completedJobs: number
    joinedAt: string
  }
  assignedContractorId?: string
  progress?: number
  timeline: string
  applications?: Array<{
    id: string
    contractor: string
    rating: number
    completedJobs: number
    message: string
    submittedAt: string
  }>
}

export function ClientJobDetails({ job }: { job: Job }) {
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const { toast } = useToast()

  const handleConfirmJob = (contractorId: string) => {
    setSelectedContractor(contractorId)
    setIsConfirming(true)
  }

  const handleConfirm = () => {
    // In a real app, this would make an API call to confirm the job
    console.log("Job confirmed with contractor:", selectedContractor)
    // Redirect to current jobs page after confirmation
    window.location.href = "/dashboard/client/current-jobs"
  }

  const handleStarClick = (rating: number) => {
    setReviewRating(rating)
  }

  const handleSubmitReview = async () => {
    if (!job.contractor?.id) {
      toast({
        title: "Error",
        description: "No contractor found for this job",
        variant: "destructive",
      })
      return
    }

    if (reviewRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating for your review",
        variant: "destructive",
      })
      return
    }

    if (reviewComment.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters for your review",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingReview(true)
      
      await reviewsApi.create({
        jobId: job.id,
        contractorId: job.contractor.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review has been posted.",
      })

      setShowReviewDialog(false)
      setReviewRating(0)
      setReviewComment("")
    } catch (error) {
      console.error('Error submitting review:', error)
      handleApiError(error, 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">Job Details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client/current-jobs">
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
                <Badge variant={
                  job.status === "OPEN" ? "secondary" :
                  job.status === "COMPLETED" ? "default" :
                  "outline"
                }>
                  {job.status === "OPEN" ? "Open" :
                   job.status === "COMPLETED" ? "Completed" :
                   "In Progress"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Posted on {job.postedAt}</span>
                {job.startedAt && <span className="ml-4">Started on {job.startedAt}</span>}
                {job.completedAt && <span className="ml-4">Completed on {job.completedAt}</span>}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Timeline: {job.timeline}</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-sm">{job.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          {job.status === "IN_PROGRESS" && job.progress && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contractor Information for Completed Jobs */}
          {job.status === "COMPLETED" && job.contractor && (
            <Card>
              <CardHeader>
                <CardTitle>Job Completed By</CardTitle>
                <CardDescription>This job was successfully completed by the following contractor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{job.contractor.businessName || job.contractor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.contractor.completedJobs} jobs completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(job.contractor.rating)}
                    <span className="ml-2 text-sm font-medium">{job.contractor.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Contractor
                  </Button>
                  
                  <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <PenTool className="mr-2 h-4 w-4" />
                        Write Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience working with {job.contractor.businessName || job.contractor.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex items-center space-x-2">
                            {renderStars(reviewRating, true, handleStarClick)}
                            <span className="text-sm text-muted-foreground ml-2">
                              {reviewRating > 0 ? `${reviewRating} star${reviewRating > 1 ? 's' : ''}` : 'Select a rating'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="review-comment">Review</Label>
                          <Textarea
                            id="review-comment"
                            placeholder="Tell others about your experience with this contractor..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <p className="text-xs text-muted-foreground">
                            {reviewComment.length}/500 characters
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReviewDialog(false)
                            setReviewRating(0)
                            setReviewComment("")
                          }}
                          disabled={submittingReview}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview || reviewRating === 0}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "OPEN" && Array.isArray(job.applications) && job.applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applications ({job.applications.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{application.contractor}</CardTitle>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                          <span>{application.rating}</span>
                        </div>
                      </div>
                      <CardDescription>
                        {application.completedJobs} jobs completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{application.message}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {/* <Button variant="outline" className="w-full" asChild>
                        <Link href="/contractors">View Profile</Link>
                      </Button> */}
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleConfirmJob(application.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {(job.status === "IN_PROGRESS" || job.status === "COMPLETED") && job.contractor && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {job.status === "COMPLETED" ? "Completed By" : "Working On This"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{job.contractor.businessName || job.contractor.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                    <span>{job.contractor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.contractor.completedJobs} jobs completed
                </p>
                <p className="text-sm text-muted-foreground">
                  Member since {job.contractor.joinedAt}
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Contractor
                  </Button>
                  {job.status === "COMPLETED" && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => setShowReviewDialog(true)}
                    >
                      <PenTool className="mr-2 h-4 w-4" />
                      Write Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "COMPLETED" && (
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="default">Completed</Badge>
                </div>
                {job.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{job.completedAt}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeline:</span>
                  <span>{job.timeline}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Job Assignment</CardTitle>
              <CardDescription>
                Are you sure you want to assign this job to the selected contractor?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsConfirming(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleConfirm}>
                Confirm Assignment
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
} 