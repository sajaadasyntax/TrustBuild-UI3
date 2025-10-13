'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, User, Calendar, MapPin, Globe, Instagram, Mail, Phone, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { contractorsApi, reviewsApi, Contractor, Review, handleApiError } from '@/lib/api'
import { Separator } from '@/components/ui/separator'

export default function ContractorProfilePage() {
  const { id } = useParams() as { id: string }
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (id) {
      fetchContractorData()
      fetchReviews()
    }
  }, [id, reviewsPage])

  const fetchContractorData = async () => {
    try {
      setLoading(true)
      const contractorData = await contractorsApi.getById(id)
      setContractor(contractorData)
    } catch (error) {
      handleApiError(error, 'Failed to load contractor profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await reviewsApi.getContractorReviews(id, { page: reviewsPage, limit: 5 })
      // API returns { status, data: { reviews, pagination } }
      const reviewData = response.data || response
      setReviews(reviewData.reviews || [])
      setReviewsTotal(reviewData.pagination?.total || 0)
      // Calculate average rating from reviews
      if (reviewData.reviews && reviewData.reviews.length > 0) {
        const avgRating = reviewData.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviewData.reviews.length
        setAverageRating(avgRating)
      }
    } catch (error) {
      handleApiError(error, 'Failed to load reviews')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="container py-32">
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contractor Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The contractor profile you are looking for doesn't exist or has been removed.
            </p>
            <Link href="/contractors">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contractors
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate rating distribution
  const externalReviews = reviews.filter(review => review.isExternal)
  const internalReviews = reviews.filter(review => !review.isExternal)

  return (
    <div className="container py-32">
      <div className="mb-8">
        <Link href="/contractors">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contractors
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contractor Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{contractor.businessName || contractor.user?.name}</CardTitle>
                  <CardDescription>{contractor.servicesProvided}</CardDescription>
                </div>
                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {(contractor.businessName || contractor.user?.name || 'C').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {renderStars(contractor.averageRating || 0)}
                <span className="font-semibold">{contractor.averageRating?.toFixed(1) || 'N/A'}</span>
                <span className="text-muted-foreground">({contractor.reviewCount || 0} reviews)</span>
              </div>

              {contractor.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">About</h3>
                  <p className="text-sm">{contractor.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
                
                <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contractor.city || 'Location not specified'}</span>
                </div>
                
                {contractor.yearsExperience && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contractor.yearsExperience} years experience</span>
                  </div>
                )}

                {contractor.operatingArea && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Serves {contractor.operatingArea}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                
                {contractor.phone && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contractor.phone}`} className="text-sm text-primary hover:underline">{contractor.phone}</a>
                  </div>
                )}

                {contractor.user?.email && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contractor.user.email}`} className="text-sm text-primary hover:underline">{contractor.user.email}</a>
                  </div>
                )}

                {contractor.website && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={contractor.website.startsWith('http') ? contractor.website : `https://${contractor.website}`} 
                      className="text-sm text-primary hover:underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {contractor.website}
                    </a>
                  </div>
                )}

                {contractor.instagramHandle && (
                  <div className="grid grid-cols-[20px_1fr] gap-x-2 items-center">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <a href={`https://instagram.com/${contractor.instagramHandle.replace('@', '')}`} 
                      className="text-sm text-primary hover:underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {contractor.instagramHandle}
                    </a>
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Post a Job for This Contractor
              </Button>
            </CardFooter>
          </Card>

          {/* Portfolio Preview */}
          {contractor.portfolio && contractor.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Recent work examples</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {contractor.portfolio.slice(0, 4).map((item) => (
                  <div key={item.id} className="aspect-square rounded-md overflow-hidden bg-muted">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </CardContent>
              {contractor.portfolio.length > 4 && (
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All {contractor.portfolio.length} Portfolio Items
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>What customers are saying about {contractor.businessName || contractor.user?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
                  <TabsTrigger value="internal">Platform Reviews ({internalReviews.length})</TabsTrigger>
                  <TabsTrigger value="external">External Reviews ({externalReviews.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="pt-6 pb-4">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {review.isExternal 
                                    ? review.customerName 
                                    : review.customer?.user?.name || 'Anonymous'}
                                </h4>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                              </div>
                              {review.isExternal && (
                                <Badge variant="outline" className="mt-1">External Review</Badge>
                              )}
                              {review.isVerified && (
                                <Badge className="bg-green-100 text-green-800 mt-1">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium mb-1">
                              {review.projectType || 'General Review'}
                            </h5>
                            <p className="text-sm">{review.comment}</p>
                          </div>

                          {review.contractorResponse && (
                            <div className="bg-blue-50 rounded-lg p-4 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">Response from {contractor.businessName || contractor.user?.name}</span>
                                {review.responseDate && (
                                  <span className="text-xs text-blue-600">
                                    {new Date(review.responseDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-blue-800">{review.contractorResponse}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {/* Pagination */}
                  {reviewsTotal > 5 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setReviewsPage(prev => Math.max(1, prev - 1))}
                          disabled={reviewsPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReviewsPage(prev => prev + 1)}
                          disabled={reviewsPage * 5 >= reviewsTotal}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="internal" className="space-y-6">
                  {internalReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No platform reviews yet</p>
                    </div>
                  ) : (
                    internalReviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="pt-6 pb-4">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">{review.customer?.user?.name || 'Anonymous'}</h4>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                              </div>
                              <Badge className="bg-green-100 text-green-800 mt-1">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium mb-1">
                              {review.job?.title || review.projectType || 'General Review'}
                            </h5>
                            <p className="text-sm">{review.comment}</p>
                          </div>

                          {review.contractorResponse && (
                            <div className="bg-blue-50 rounded-lg p-4 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">Response from {contractor.businessName || contractor.user?.name}</span>
                                {review.responseDate && (
                                  <span className="text-xs text-blue-600">
                                    {new Date(review.responseDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-blue-800">{review.contractorResponse}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="external" className="space-y-6">
                  {externalReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No external reviews yet</p>
                    </div>
                  ) : (
                    externalReviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="pt-6 pb-4">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">{review.customerName || 'Past Client'}</h4>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                  {review.projectDate && (
                                    <span>• Project: {new Date(review.projectDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                              </div>
                              <Badge variant="outline">External Review</Badge>
                              {review.isVerified && (
                                <Badge className="bg-green-100 text-green-800 mt-1 ml-2">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium mb-1">
                              {review.projectType || 'Past Project'}
                            </h5>
                            <p className="text-sm">{review.comment}</p>
                          </div>

                          {review.contractorResponse && (
                            <div className="bg-blue-50 rounded-lg p-4 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-900">Response from {contractor.businessName || contractor.user?.name}</span>
                                {review.responseDate && (
                                  <span className="text-xs text-blue-600">
                                    {new Date(review.responseDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-blue-800">{review.contractorResponse}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
