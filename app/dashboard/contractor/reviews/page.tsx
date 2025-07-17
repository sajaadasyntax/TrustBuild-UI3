'use client'

import { useState, useEffect } from 'react'
import { Star, Search, Filter, MessageSquare, Calendar, User, ThumbsUp, Flag, RefreshCw, AlertCircle } from 'lucide-react'
import { reviewsApi, handleApiError, Review } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ContractorReviews() {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CONTRACTOR') {
      fetchReviews()
    }
  }, [isAuthenticated, user])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const reviewsData = await reviewsApi.getMyReceived()
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      handleApiError(error, 'Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleAddResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a response',
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmittingResponse(true)
      await reviewsApi.respond(reviewId, responseText)
      
      // Update the local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              contractorResponse: responseText,
              responseDate: new Date().toISOString()
            }
          : review
      ))
      
      setResponseText('')
      setShowResponseForm(null)
      
      toast({
        title: 'Success',
        description: 'Response added successfully',
      })
    } catch (error) {
      console.error('Error adding response:', error)
      handleApiError(error, 'Failed to add response')
    } finally {
      setSubmittingResponse(false)
    }
  }

  // Calculate statistics
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating
    return matchesSearch && matchesRating
  })

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Authentication check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (user.role !== 'CONTRACTOR') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                This page is only available to contractors.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">Manage and respond to customer reviews</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading reviews...</span>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
                <p className="text-2xl font-bold text-green-600">
                  {reviews.length > 0 
                    ? Math.round((reviews.filter(r => r.contractorResponse).length / reviews.length) * 100)
                    : 0
                  }%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Verified Reviews</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {reviews.filter(r => r.isVerified).length}
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">{rating}</span>
                    {renderStars(rating)}
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ 
                          width: `${reviews.length > 0 ? (ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">
                      {ratingCounts[rating as keyof typeof ratingCounts]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reviews by customer, comment, or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-500">
                    {reviews.length === 0 
                      ? "You haven't received any reviews yet. Complete some jobs to start getting reviews!"
                      : "No reviews match your current filters."
                    }
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.customer?.user?.name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            {review.isVerified && (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {review.job?.title || 'Job'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Project: {review.projectType || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Contractor Response */}
                    {review.contractorResponse ? (
                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Your Response</span>
                          <span className="text-xs text-blue-600">
                            {review.responseDate && new Date(review.responseDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-blue-800">{review.contractorResponse}</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {showResponseForm === review.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Write your response to this review..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleAddResponse(review.id)}
                                disabled={submittingResponse}
                                size="sm"
                              >
                                {submittingResponse ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Posting...
                                  </>
                                ) : (
                                  'Post Response'
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setShowResponseForm(null)
                                  setResponseText('')
                                }}
                                disabled={submittingResponse}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowResponseForm(review.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond to Review
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 