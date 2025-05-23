"use client"

import { Star, TrendingUp, MessageSquare, ThumbsUp, AlertTriangle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ReviewAnalyticsPage() {
  const reviewStats = {
    totalReviews: 12450,
    averageRating: 4.6,
    fiveStarReviews: 7890,
    fourStarReviews: 2680,
    threeStarReviews: 1230,
    twoStarReviews: 410,
    oneStarReviews: 240,
    pendingModeration: 89,
    flaggedReviews: 23,
  }

  const ratingDistribution = [
    { rating: 5, count: 7890, percentage: 63.4 },
    { rating: 4, count: 2680, percentage: 21.5 },
    { rating: 3, count: 1230, percentage: 9.9 },
    { rating: 2, count: 410, percentage: 3.3 },
    { rating: 1, count: 240, percentage: 1.9 },
  ]

  const topContractorsByReviews = [
    { name: "Smith & Sons Builders", reviews: 156, avgRating: 4.9, sentiment: "positive" },
    { name: "Modern Interiors Ltd", reviews: 143, avgRating: 4.8, sentiment: "positive" },
    { name: "Elite Construction Co", reviews: 134, avgRating: 4.8, sentiment: "positive" },
    { name: "Premium Home Solutions", reviews: 128, avgRating: 4.7, sentiment: "positive" },
    { name: "Expert Renovations", reviews: 122, avgRating: 4.7, sentiment: "positive" },
  ]

  const sentimentAnalysis = {
    positive: 8745,
    neutral: 2890,
    negative: 815,
  }

  const commonKeywords = [
    { word: "professional", mentions: 3450, sentiment: "positive" },
    { word: "quality", mentions: 2890, sentiment: "positive" },
    { word: "timely", mentions: 2340, sentiment: "positive" },
    { word: "excellent", mentions: 2100, sentiment: "positive" },
    { word: "delayed", mentions: 890, sentiment: "negative" },
    { word: "poor", mentions: 450, sentiment: "negative" },
  ]

  const monthlyTrends = [
    { month: "Jan", reviews: 1890, avgRating: 4.5 },
    { month: "Feb", reviews: 1780, avgRating: 4.6 },
    { month: "Mar", reviews: 2100, avgRating: 4.7 },
    { month: "Apr", reviews: 2240, avgRating: 4.6 },
    { month: "May", reviews: 2340, avgRating: 4.5 },
    { month: "Jun", reviews: 2100, avgRating: 4.8 },
  ]

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Review Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive analysis of customer reviews and ratings across the platform
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {reviewStats.totalReviews.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {reviewStats.averageRating}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {((reviewStats.fiveStarReviews + reviewStats.fourStarReviews) / reviewStats.totalReviews * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Positive Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {reviewStats.flaggedReviews}
            </div>
            <p className="text-sm text-muted-foreground">Flagged Reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
            <CardDescription>Breakdown of all customer ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratingDistribution.map((rating) => (
                <div key={rating.rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="font-medium">{rating.rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-16 text-right">
                    {rating.count.toLocaleString()}
                  </div>
                  <Badge variant="outline" className="w-12">
                    {rating.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
            <CardDescription>Overall sentiment of customer reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="font-medium">Positive</span>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="bg-green-500">
                    {sentimentAnalysis.positive.toLocaleString()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((sentimentAnalysis.positive / reviewStats.totalReviews) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span className="font-medium">Neutral</span>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {sentimentAnalysis.neutral.toLocaleString()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((sentimentAnalysis.neutral / reviewStats.totalReviews) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="font-medium">Negative</span>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">
                    {sentimentAnalysis.negative.toLocaleString()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((sentimentAnalysis.negative / reviewStats.totalReviews) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contractors by Reviews */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Top Reviewed Contractors
          </CardTitle>
          <CardDescription>Contractors with the most customer reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topContractorsByReviews.map((contractor, index) => (
              <div key={contractor.name} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    ⭐ {contractor.avgRating}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm mb-2">{contractor.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {contractor.reviews} reviews
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Common Keywords
            </CardTitle>
            <CardDescription>Most frequently mentioned words in reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commonKeywords.map((keyword) => (
                <div key={keyword.word} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{keyword.word}</span>
                    <Badge variant={keyword.sentiment === "positive" ? "default" : "destructive"}>
                      {keyword.sentiment}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {keyword.mentions.toLocaleString()} mentions
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Review Trends
            </CardTitle>
            <CardDescription>Review volume and rating trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {month.month}
                    </div>
                    <div>
                      <p className="font-medium">{month.reviews.toLocaleString()} reviews</p>
                      <p className="text-sm text-muted-foreground">
                        Average: ⭐ {month.avgRating}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 