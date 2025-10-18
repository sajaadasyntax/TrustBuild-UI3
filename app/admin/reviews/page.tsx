"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Star, Eye, AlertTriangle, CheckCircle, X, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { adminApi } from '@/lib/adminApi'
import { toast } from '@/hooks/use-toast'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  isVerified: boolean
  job: {
    title: string
  }
  customer: {
    user: {
      name: string
    }
  }
  contractor: {
    businessName: string
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

export default function ReviewManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [moderatingReviews, setModeratingReviews] = useState<Set<string>>(new Set())

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 20,
      }
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter
      if (ratingFilter !== 'all') params.rating = ratingFilter
      const response = await adminApi.getAllReviews(params)
      const reviews = (response.data as any).reviews || []
      const pagination = (response.data as any).pagination
      setReviews(reviews)
      setTotalPages(pagination?.pages || 1)
    } catch (error) {
      handleApiError(error, 'Failed to fetch reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, ratingFilter, page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const filteredReviews = reviews.filter((review) => {
    const customerName = review.customer?.user?.name || ''
    const contractorName = review.contractor?.businessName || ''
    const comment = review.comment || ''
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.toLowerCase().includes(searchQuery.toLowerCase())
    const status = review.isVerified ? 'approved' : 'pending'
    const matchesStatus = statusFilter === "all" || status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleApprove = async (reviewId: string) => {
    if (moderatingReviews.has(reviewId)) return;
    
    setModeratingReviews(prev => new Set(prev).add(reviewId))
    
    try {
      await adminApi.moderateContent('review', reviewId, 'approve')
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, isVerified: true }
            : review
        )
      )
    } catch (error) {
      handleApiError(error, 'Failed to approve review')
    } finally {
      setModeratingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const handleReject = async (reviewId: string) => {
    if (moderatingReviews.has(reviewId)) return;
    
    setModeratingReviews(prev => new Set(prev).add(reviewId))
    
    try {
      await adminApi.moderateContent('review', reviewId, 'reject')
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, isVerified: false }
            : review
        )
      )
    } catch (error) {
      handleApiError(error, 'Failed to reject review')
    } finally {
      setModeratingReviews(prev => {
        const newSet = new Set(prev)
        newSet.delete(reviewId)
        return newSet
      })
    }
  }

  const getStatusBadge = (review: Review) => {
    const status = review.isVerified ? 'approved' : 'pending'
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
      />
    ))
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Review Management</h1>
        </div>
        <p className="text-muted-foreground">
          Moderate reviews and handle reports across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews, customers, or contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rating" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => !r.isVerified).length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.isVerified).length}
            </div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {/* No flag reason in Review type; placeholder for future flagged logic */}
              0
            </div>
            <p className="text-sm text-muted-foreground">Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {/* No rejected status in Review model, so show 0 or future logic */}
              0
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const customerName = review.customer?.user?.name || 'Unknown Customer'
          const contractorName = review.contractor?.businessName || 'Unknown Contractor'
          const jobTitle = review.job?.title || 'Unknown Job'
          const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''
          return (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${customerName}`} />
                      <AvatarFallback>{customerName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {customerName}
                        {getStatusBadge(review)}
                        {/* No flag icon, as Review type has no flagReason */}
                      </CardTitle>
                      <CardDescription>
                        Review for {contractorName} • {jobTitle}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-muted-foreground">{date}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{review.comment}</p>
                {/* No flagged reason block, as Review type has no flagReason */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job Details
                  </Button>
                  {!review.isVerified && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(review.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={moderatingReviews.has(review.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {moderatingReviews.has(review.id) ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(review.id)}
                        disabled={moderatingReviews.has(review.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {moderatingReviews.has(review.id) ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 