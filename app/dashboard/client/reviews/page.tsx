"use client"

import { useState, useEffect } from "react"
import { Star, RefreshCw, AlertCircle, MessageSquare, User, Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { reviewsApi, handleApiError, Review } from "@/lib/api"

export default function CustomerReviewsPage() {
  const { user, isAuthenticated } = useAuth()
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CUSTOMER') {
      fetchMyReviews()
    }
  }, [isAuthenticated, user])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      const reviewsData = await reviewsApi.getMyGiven()
      setMyReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      handleApiError(error, 'Failed to fetch your reviews')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
          <p className="text-muted-foreground">
            View all the reviews you&apos;ve written for contractors
          </p>
        </div>

        {loading ? (
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
                You haven&apos;t written any reviews yet. Reviews can be written from your completed job pages.
              </p>
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Reviews</h2>
                <p className="text-sm text-muted-foreground">
                  {myReviews.length} review{myReviews.length !== 1 ? 's' : ''}
                </p>
              </div>
              
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

                    {/* Job Link */}
                    {review.job && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Related to job: {review.job.title}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 