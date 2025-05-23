"use client"

import { useState } from "react"
import { Search, Star, Eye, AlertTriangle, CheckCircle, X, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const mockReviews = [
  {
    id: "review1",
    customerName: "John Doe",
    contractorName: "Smith & Sons Builders",
    rating: 5,
    comment: "Excellent work on our kitchen renovation. Very professional team and great attention to detail.",
    jobTitle: "Kitchen Renovation",
    date: "2024-03-15",
    status: "approved",
    flagged: false,
    reportReason: null,
  },
  {
    id: "review2",
    customerName: "Jane Smith",
    contractorName: "Modern Interiors Ltd",
    rating: 2,
    comment: "Work was delayed and quality was poor. Would not recommend this contractor to anyone.",
    jobTitle: "Bathroom Remodeling",
    date: "2024-03-14",
    status: "pending",
    flagged: true,
    reportReason: "Potentially false review",
  },
  {
    id: "review3",
    customerName: "Mike Johnson",
    contractorName: "Elite Home Solutions",
    rating: 1,
    comment: "Terrible service! They damaged my property and refused to fix it. Absolute scam artists!",
    jobTitle: "Home Extension",
    date: "2024-03-13",
    status: "pending",
    flagged: true,
    reportReason: "Inappropriate language",
  },
  {
    id: "review4",
    customerName: "Sarah Wilson",
    contractorName: "Quick Fix Repairs",
    rating: 4,
    comment: "Good service overall, minor delays but quality work completed on time.",
    jobTitle: "Electrical Wiring",
    date: "2024-03-12",
    status: "approved",
    flagged: false,
    reportReason: null,
  },
]

export default function ReviewManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviews, setReviews] = useState(mockReviews)

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleApprove = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: "approved", flagged: false }
          : review
      )
    )
  }

  const handleReject = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: "rejected" }
          : review
      )
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
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
              {reviews.filter(r => r.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.status === "approved").length}
            </div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {reviews.filter(r => r.flagged).length}
            </div>
            <p className="text-sm text-muted-foreground">Flagged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {reviews.filter(r => r.status === "rejected").length}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className={review.flagged ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${review.customerName}`} />
                    <AvatarFallback>{review.customerName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {review.customerName}
                      {getStatusBadge(review.status)}
                      {review.flagged && <Flag className="h-4 w-4 text-red-500" />}
                    </CardTitle>
                    <CardDescription>
                      Review for {review.contractorName} • {review.jobTitle}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{review.comment}</p>
              
              {review.flagged && review.reportReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Flagged for Review</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Reason: {review.reportReason}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Job Details
                </Button>
                {review.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleReject(review.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 