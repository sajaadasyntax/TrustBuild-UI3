'use client'

import { useState } from 'react'
import { Star, Search, Filter, MessageSquare, Calendar, User, ThumbsUp, Flag } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  customerAvatar?: string
  rating: number
  title: string
  comment: string
  date: string
  project: string
  verified: boolean
  helpful: number
  response?: {
    message: string
    date: string
  }
}

export default function ContractorReviews() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      rating: 5,
      title: 'Excellent kitchen renovation work',
      comment: 'Mike did an outstanding job on our kitchen renovation. Very professional, completed on time, and the quality exceeded our expectations. Highly recommend!',
      date: '2024-03-10',
      project: 'Kitchen Renovation',
      verified: true,
      helpful: 8,
      response: {
        message: 'Thank you so much for the kind words! It was a pleasure working on your beautiful kitchen.',
        date: '2024-03-11'
      }
    },
    {
      id: '2',
      customerName: 'John Smith',
      rating: 4,
      title: 'Good bathroom remodel',
      comment: 'Solid work on the bathroom remodel. A few minor delays but overall happy with the result. Would work with again.',
      date: '2024-03-08',
      project: 'Bathroom Remodel',
      verified: true,
      helpful: 5
    },
    {
      id: '3',
      customerName: 'Lisa Davis',
      rating: 5,
      title: 'Amazing electrical work',
      comment: 'Professional, knowledgeable, and efficient. Fixed all our electrical issues and installed new outlets perfectly. Great communication throughout.',
      date: '2024-03-05',
      project: 'Electrical Repair',
      verified: true,
      helpful: 12,
      response: {
        message: 'Thanks Lisa! Safety is always my top priority with electrical work. Glad everything is working perfectly.',
        date: '2024-03-05'
      }
    },
    {
      id: '4',
      customerName: 'Mike Brown',
      rating: 3,
      title: 'Decent plumbing work',
      comment: 'Work was done correctly but took longer than expected. Communication could have been better.',
      date: '2024-03-01',
      project: 'Plumbing Repair',
      verified: true,
      helpful: 2
    },
    {
      id: '5',
      customerName: 'Jennifer Wilson',
      rating: 5,
      title: 'Outstanding deck construction',
      comment: 'Built our dream deck exactly as we envisioned. Attention to detail was incredible and the craftsmanship is top-notch.',
      date: '2024-02-28',
      project: 'Deck Construction',
      verified: true,
      helpful: 15,
      response: {
        message: 'Thank you Jennifer! Your deck design was fantastic to work with. Enjoy your new outdoor space!',
        date: '2024-02-28'
      }
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating
    return matchesSearch && matchesRating
  })

  const handleAddResponse = (reviewId: string) => {
    if (responseText.trim()) {
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              response: { 
                message: responseText, 
                date: new Date().toISOString().split('T')[0] 
              } 
            }
          : review
      ))
      setResponseText('')
      setShowResponseForm(null)
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2">Manage and respond to customer reviews</p>
        </div>

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
              {Math.round((reviews.filter(r => r.response).length / reviews.length) * 100)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Helpful Votes</h3>
            <p className="text-2xl font-bold text-blue-600">
              {reviews.reduce((sum, review) => sum + review.helpful, 0)}
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
                <span className="text-sm text-gray-600 w-8">
                  {ratingCounts[rating as keyof typeof ratingCounts]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Project: {review.project}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ThumbsUp className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{review.helpful} helpful</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700">{review.comment}</p>
              </div>

              {review.response ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Your Response</span>
                    <span className="text-xs text-blue-600">
                      {new Date(review.response.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-blue-800 text-sm">{review.response.message}</p>
                </div>
              ) : (
                <div>
                  {showResponseForm === review.id ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => handleAddResponse(review.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Post Response
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseForm(null)
                            setResponseText('')
                          }}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResponseForm(review.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Respond to review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 