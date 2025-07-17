"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, Upload, CheckCircle2, RefreshCw, AlertCircle, MessageSquare, User, Calendar, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { reviewsApi, contractorsApi, handleApiError, Review, Contractor } from "@/lib/api"

const reviewSchema = z.object({
  contractorId: z.string().min(1, "Please select a contractor"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  isExternal: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  projectDate: z.string().optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

const projectTypes = [
  "Kitchen Renovation",
  "Bathroom Remodeling",
  "Home Extension",
  "General Construction",
  "Electrical Work",
  "Plumbing",
  "Painting",
  "Flooring",
  "Other",
]

export default function CustomerReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [isExternal, setIsExternal] = useState(false)
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      isExternal: false,
    },
  })

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CUSTOMER') {
      fetchMyReviews()
      fetchContractors()
    }
  }, [isAuthenticated, user])

  const fetchMyReviews = async () => {
    try {
      setReviewsLoading(true)
      const reviewsData = await reviewsApi.getMyGiven()
      setMyReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      handleApiError(error, 'Failed to fetch your reviews')
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchContractors = async () => {
    try {
      setLoading(true)
      // Get contractors - you may need to implement this API call
      // For now using mock data
      const mockContractors = [
        { id: "1", businessName: "Smith & Sons Builders", user: { name: "John Smith" } },
        { id: "2", businessName: "Modern Interiors Ltd", user: { name: "Sarah Johnson" } },
        { id: "3", businessName: "Elite Home Solutions", user: { name: "Mike Wilson" } },
      ]
      setContractors(mockContractors as any)
    } catch (error) {
      console.error('Error fetching contractors:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true)
    
    try {
      await reviewsApi.create({
        jobId: "temp-job-id", // You'll need to implement job selection
        contractorId: data.contractorId,
        rating: data.rating,
        comment: data.comment,
      })
      
      toast({
        title: "Success!",
        description: "Your review has been submitted successfully.",
      })
      
      // Reset form and refresh reviews
      form.reset()
      setSelectedRating(0)
      fetchMyReviews()
    } catch (error) {
      console.error('Error submitting review:', error)
      handleApiError(error, 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4', interactive = false, onClick?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    )
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="container py-32">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              This page is only available to customers.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Reviews</h1>
          <p className="text-muted-foreground">
            Manage your reviews and share experiences with contractors
          </p>
        </div>

        <Tabs defaultValue="my-reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-reviews">My Reviews ({myReviews.length})</TabsTrigger>
            <TabsTrigger value="write-review">Write Review</TabsTrigger>
          </TabsList>

          <TabsContent value="my-reviews" className="space-y-6">
            {reviewsLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading your reviews...</span>
              </div>
            ) : myReviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t written any reviews yet. Share your experience with contractors to help others!
                  </p>
                  <Button onClick={() => {
                    const tabsTrigger = document.querySelector('[value="write-review"]') as HTMLElement
                    tabsTrigger?.click()
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Write Your First Review
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Reviews Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Reviews</p>
                          <p className="text-2xl font-bold">{myReviews.length}</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Rating</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                              {(myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length).toFixed(1)}
                            </p>
                            {renderStars(Math.round(myReviews.reduce((sum, review) => sum + review.rating, 0) / myReviews.length))}
                          </div>
                        </div>
                        <Star className="h-8 w-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Contractor Responses</p>
                          <p className="text-2xl font-bold">
                            {myReviews.filter(r => r.contractorResponse).length}
                          </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {review.contractor?.businessName || 'Unknown Contractor'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                {review.isVerified && (
                                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {review.job?.title || 'Project'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {review.projectType || 'General'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>

                        {/* Contractor Response */}
                        {review.contractorResponse && (
                          <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Contractor Response</span>
                              {review.responseDate && (
                                <span className="text-xs text-blue-600">
                                  {new Date(review.responseDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-blue-800">{review.contractorResponse}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="write-review">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Review</CardTitle>
                <CardDescription>
                  {isExternal 
                    ? "Add a review from a customer outside the platform"
                    : "Write a review for a contractor you've worked with"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Review Type</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={!isExternal ? "default" : "outline"}
                        onClick={() => setIsExternal(false)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        In-App Review
                      </Button>
                      <Button
                        type="button"
                        variant={isExternal ? "default" : "outline"}
                        onClick={() => setIsExternal(true)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        External Review
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contractor</Label>
                    <Select
                      onValueChange={(value) => form.setValue("contractorId", value)}
                      defaultValue={form.getValues("contractorId")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contractor" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractors.map((contractor) => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.businessName || contractor.user?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    {renderStars(selectedRating, 'h-8 w-8', true, (rating) => {
                      setSelectedRating(rating)
                      form.setValue("rating", rating)
                    })}
                  </div>

                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Select
                      onValueChange={(value) => form.setValue("projectType", value)}
                      defaultValue={form.getValues("projectType")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isExternal && (
                    <>
                      <div className="space-y-2">
                        <Label>Customer Name</Label>
                        <Input
                          {...form.register("customerName")}
                          placeholder="Enter customer name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Customer Email</Label>
                        <Input
                          type="email"
                          {...form.register("customerEmail")}
                          placeholder="Enter customer email"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Project Date</Label>
                    <Input
                      type="date"
                      {...form.register("projectDate")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Review</Label>
                    <Textarea
                      {...form.register("comment")}
                      placeholder="Share your experience with this contractor..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || selectedRating === 0}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Review...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 