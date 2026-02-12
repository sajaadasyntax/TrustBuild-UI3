"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  CreditCard,
  Shield,
  Activity,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Award,
  MessageCircle,
  Image as ImageIcon,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  AlertCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminApi } from '@/lib/adminApi'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { toast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

interface Contractor {
  id: string
  userId: string
  businessName: string
  contactName: string
  email: string
  phone: string
  serviceArea: string
  specialties: string[]
  rating: number
  totalJobs: number
  activeJobs: number
  completionRate: number
  isApproved: boolean
  isActive: boolean
  profileApproved: boolean
  status?: string
  tier?: string
  subscriptionStatus: string
  createdAt: string
  creditsBalance?: number
  weeklyCreditsLimit?: number
  user?: {
    name?: string
    email?: string
  }
  city?: string
  postcode?: string
  jobsCompleted?: number
  averageRating?: number
  reviewCount?: number
  yearsExperience?: string
  servicesProvided?: string
  description?: string
  subscription?: {
    status?: string
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

export default function AdminContractorProfile() {
  const router = useRouter()
  const params = useParams()
  const { admin, loading: authLoading } = useAdminAuth()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)
  const [showJobsDialog, setShowJobsDialog] = useState(false)
  const [showReviewsDialog, setShowReviewsDialog] = useState(false)
  const [completedJobs, setCompletedJobs] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Portfolio / Media Manager state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false)
  const [deleteImageTarget, setDeleteImageTarget] = useState<any>(null)
  const [deleteImageReason, setDeleteImageReason] = useState('')
  const [deletingImage, setDeletingImage] = useState(false)

  const contractorId = params?.id as string

  useEffect(() => {
    if (!authLoading && admin && contractorId) {
      fetchContractor()
    }
  }, [authLoading, admin, contractorId])

  const fetchContractor = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAllContractors()
      
      // Check if response has contractors array
      const contractorsList = response?.contractors || response?.data?.contractors || []
      const foundContractor = contractorsList.find((c: Contractor) => c.id === contractorId)
      
      if (foundContractor) {
        setContractor(foundContractor)
      } else {
        throw new Error('Contractor not found')
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch contractor details')
      router.push('/admin/contractors')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletedJobs = async () => {
    if (!contractorId) return
    try {
      setLoadingDetails(true)
      const response = await adminApi.getContractorCompletedJobs(contractorId)
      setCompletedJobs(response?.jobs || response?.data?.jobs || [])
    } catch (error) {
      console.error('Failed to fetch completed jobs:', error)
      setCompletedJobs([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const fetchReviews = async () => {
    if (!contractorId) return
    try {
      setLoadingDetails(true)
      const response = await adminApi.getContractorReviews(contractorId)
      setReviews(response?.reviews || response?.data?.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setReviews([])
    } finally {
      setLoadingDetails(false)
    }
  }

  const fetchPortfolio = async () => {
    if (!contractorId) return
    try {
      setLoadingPortfolio(true)
      const response = await adminApi.getContractorPortfolio(contractorId)
      setPortfolioItems(response?.data?.portfolioItems || [])
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
      setPortfolioItems([])
    } finally {
      setLoadingPortfolio(false)
    }
  }

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const goToPrevious = useCallback(() => {
    if (portfolioItems.length === 0) return
    setLightboxIndex((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length)
  }, [portfolioItems.length])

  const goToNext = useCallback(() => {
    if (portfolioItems.length === 0) return
    setLightboxIndex((prev) => (prev + 1) % portfolioItems.length)
  }, [portfolioItems.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext])

  // Open delete confirmation dialog for a portfolio item
  const openDeleteImageDialog = (item: any) => {
    setDeleteImageTarget(item)
    setDeleteImageReason('')
    setShowDeleteImageDialog(true)
  }

  // Handle portfolio image deletion
  const handleDeletePortfolioItem = async () => {
    if (!deleteImageTarget || !contractorId) return
    try {
      setDeletingImage(true)
      await adminApi.deleteContractorPortfolioItem(
        contractorId,
        deleteImageTarget.id,
        deleteImageReason || undefined
      )
      toast({
        title: 'Image Deleted',
        description: `"${deleteImageTarget.title}" has been removed from the contractor's portfolio and storage.`,
      })
      setShowDeleteImageDialog(false)
      setDeleteImageTarget(null)
      setDeleteImageReason('')
      // Refresh the portfolio
      fetchPortfolio()
      // Close lightbox if it was open
      if (lightboxOpen) closeLightbox()
    } catch (error) {
      handleApiError(error, 'Failed to delete portfolio image')
    } finally {
      setDeletingImage(false)
    }
  }

  useEffect(() => {
    if (showJobsDialog) {
      fetchCompletedJobs()
    }
  }, [showJobsDialog])

  useEffect(() => {
    if (showReviewsDialog) {
      fetchReviews()
    }
  }, [showReviewsDialog])

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'ACTIVE':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'SUSPENDED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'PENDING':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>
      case 'INACTIVE':
        return <Badge variant="outline"><Activity className="h-3 w-3 mr-1" />Inactive</Badge>
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>
    }
  }

  const getTierBadge = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'PREMIUM':
        return <Badge className="bg-amber-500"><Award className="h-3 w-3 mr-1" />Premium</Badge>
      case 'STANDARD':
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Standard</Badge>
      case 'FREE':
        return <Badge variant="outline"><User className="h-3 w-3 mr-1" />Free</Badge>
      default:
        return <Badge variant="outline">{tier || 'No Tier'}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading contractor profile...</span>
        </div>
      </div>
    )
  }

  if (!contractor) {
    return (
      <div className="container py-32">
        <Card>
          <CardContent className="py-20 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contractor Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The contractor you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/admin/contractors')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contractors
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-32 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/contractors')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contractor Profile</h1>
            <p className="text-muted-foreground">View contractor details and manage their account</p>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(contractor.status)}
          {getTierBadge(contractor.tier)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl">
                  {contractor.businessName?.slice(0, 2).toUpperCase() || 'CO'}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{contractor.businessName || contractor.contactName}</CardTitle>
              <CardDescription>{contractor.user?.email || contractor.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Contact:</span>
                  <span className="text-muted-foreground">{contractor.contactName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span className="text-muted-foreground truncate">{contractor.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span className="text-muted-foreground">{contractor.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span className="text-muted-foreground">
                    {contractor.city && contractor.postcode 
                      ? `${contractor.city}, ${contractor.postcode}`
                      : contractor.serviceArea || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Member Since:</span>
                  <span className="text-muted-foreground">
                    {new Date(contractor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Quick Stats - Clickable to show details */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => setShowJobsDialog(true)}
                >
                  <div className="text-2xl font-bold text-blue-600">{contractor.jobsCompleted || contractor.totalJobs || 0}</div>
                  <div className="text-xs text-muted-foreground">Jobs Completed</div>
                  <div className="text-xs text-blue-600 mt-1">Click to view →</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    {contractor.averageRating?.toFixed(1) || contractor.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Average Rating</div>
                </div>
                <div 
                  className="text-center p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => setShowReviewsDialog(true)}
                >
                  <div className="text-2xl font-bold text-blue-600">{contractor.reviewCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                  <div className="text-xs text-blue-600 mt-1">Click to view →</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{contractor.completionRate || 0}%</div>
                  <div className="text-xs text-muted-foreground">Completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media" onClick={() => { if (portfolioItems.length === 0) fetchPortfolio() }}>
                <ImageIcon className="h-4 w-4 mr-1" />Media
              </TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Contractor business details and services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contractor.description && (
                    <div>
                      <h4 className="font-medium mb-2">About</h4>
                      <p className="text-sm text-muted-foreground">{contractor.description}</p>
                    </div>
                  )}

                  {contractor.yearsExperience && (
                    <div>
                      <h4 className="font-medium mb-2">Experience</h4>
                      <p className="text-sm text-muted-foreground">{contractor.yearsExperience} years</p>
                    </div>
                  )}

                  {contractor.specialties && contractor.specialties.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {contractor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {contractor.servicesProvided && (
                    <div>
                      <h4 className="font-medium mb-2">Services</h4>
                      <p className="text-sm text-muted-foreground">{contractor.servicesProvided}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                  <CardDescription>Current account status and approvals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Profile Approved</p>
                        <p className="text-xs text-muted-foreground">Admin verification</p>
                      </div>
                      {contractor.profileApproved ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-destructive" />
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <p className="text-xs text-muted-foreground">Current state</p>
                      </div>
                      {getStatusBadge(contractor.status)}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Subscription Tier</p>
                        <p className="text-xs text-muted-foreground">Current plan</p>
                      </div>
                      {getTierBadge(contractor.tier)}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Active Jobs</p>
                        <p className="text-xs text-muted-foreground">Currently working</p>
                      </div>
                      <span className="text-2xl font-bold">{contractor.activeJobs || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media / Portfolio Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Contractor Media Manager
                      </CardTitle>
                      <CardDescription>
                        View and moderate the contractor's portfolio images. These are the same images customers see on the public profile.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{portfolioItems.length} / 20 images</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPortfolio}
                        disabled={loadingPortfolio}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${loadingPortfolio ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingPortfolio ? (
                    <div className="flex items-center justify-center py-16">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary mr-2" />
                      <span>Loading portfolio images...</span>
                    </div>
                  ) : portfolioItems.length === 0 ? (
                    <div className="text-center py-16">
                      <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Portfolio Images</h3>
                      <p className="text-muted-foreground">
                        This contractor has not uploaded any portfolio images yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {portfolioItems.map((item: any, index: number) => (
                        <div key={item.id} className="group relative rounded-lg overflow-hidden border bg-muted">
                          {/* Thumbnail - clickable for lightbox */}
                          <button
                            type="button"
                            onClick={() => openLightbox(index)}
                            className="block w-full aspect-square focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.title || 'Portfolio image'}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                            </div>
                          </button>

                          {/* Image details + delete button */}
                          <div className="p-2 space-y-1">
                            <p className="text-xs font-medium truncate" title={item.title}>
                              {item.title || 'Untitled'}
                            </p>
                            {item.projectDate && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.projectDate).toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full mt-1 h-7 text-xs"
                              onClick={() => openDeleteImageDialog(item)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete / Hide
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credits & Usage
                  </CardTitle>
                  <CardDescription>Contractor credit balance and weekly limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border rounded-lg text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-3xl font-bold">{contractor.creditsBalance || 0}</p>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                    </div>
                    <div className="p-6 border rounded-lg text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-3xl font-bold">{contractor.weeklyCreditsLimit || 0}</p>
                      <p className="text-sm text-muted-foreground">Weekly Limit</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={() => router.push('/admin/contractors')}
                      variant="outline"
                    >
                      Manage Credits
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Subscription Details
                  </CardTitle>
                  <CardDescription>Contractor subscription information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Subscription Status</p>
                        <p className="text-sm text-muted-foreground">Current subscription state</p>
                      </div>
                      <Badge>{contractor.subscriptionStatus || 'Unknown'}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Tier</p>
                        <p className="text-sm text-muted-foreground">Subscription level</p>
                      </div>
                      {getTierBadge(contractor.tier)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Contractor activity logs and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Activity logs will be displayed here</p>
                    <p className="text-sm">Check back later for contractor activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Completed Jobs Dialog */}
      <Dialog open={showJobsDialog} onOpenChange={setShowJobsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Completed Jobs ({completedJobs.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : completedJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed jobs found.
              </div>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job: any) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{job.title}</h4>
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Completed: {job.completionDate ? new Date(job.completionDate).toLocaleDateString() : 'N/A'}
                            </div>
                            {job.finalAmount && (
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Final Amount: £{Number(job.finalAmount).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      <Dialog open={showReviewsDialog} onOpenChange={setShowReviewsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reviews ({reviews.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reviews found.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.rating}/5</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {review.customerName || review.customer?.user?.name || 'Anonymous'}
                        {review.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {review.isExternal && (
                          <Badge variant="outline">External</Badge>
                        )}
                      </div>
                      {review.job?.title && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          Job: {review.job.title}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Portfolio Lightbox Modal */}
      {lightboxOpen && portfolioItems.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio image viewer"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeLightbox}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium bg-black/50 rounded-full px-3 py-1">
            {lightboxIndex + 1} / {portfolioItems.length}
          </div>

          {/* Delete button in lightbox */}
          <button
            type="button"
            onClick={() => openDeleteImageDialog(portfolioItems[lightboxIndex])}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Trash2 className="h-4 w-4" />
            Delete / Hide
          </button>

          {/* Previous button */}
          {portfolioItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevious() }}
              className="absolute left-4 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {portfolioItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext() }}
              className="absolute right-4 z-10 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Main image container */}
          <div
            className="relative z-[1] flex flex-col items-center max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={portfolioItems[lightboxIndex]?.imageUrl}
              alt={portfolioItems[lightboxIndex]?.title || 'Portfolio image'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              style={{ aspectRatio: 'auto' }}
            />

            {/* Image info overlay */}
            <div className="mt-4 text-center max-w-lg">
              {portfolioItems[lightboxIndex]?.title && (
                <h3 className="text-white text-lg font-semibold">
                  {portfolioItems[lightboxIndex].title}
                </h3>
              )}
              {portfolioItems[lightboxIndex]?.description && (
                <p className="text-white/70 text-sm mt-1">
                  {portfolioItems[lightboxIndex].description}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 mt-2 text-white/50 text-xs">
                {portfolioItems[lightboxIndex]?.projectDate && (
                  <span>
                    Project: {new Date(portfolioItems[lightboxIndex].projectDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                )}
                <span>
                  Uploaded: {new Date(portfolioItems[lightboxIndex]?.createdAt).toLocaleDateString()}
                </span>
                {portfolioItems[lightboxIndex]?.cloudinaryId && (
                  <span className="font-mono text-white/30">
                    {portfolioItems[lightboxIndex].cloudinaryId}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Portfolio Image Confirmation Dialog */}
      <Dialog open={showDeleteImageDialog} onOpenChange={setShowDeleteImageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Portfolio Image
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the image from both Cloudinary storage and the database.
              The contractor will be notified.
            </DialogDescription>
          </DialogHeader>

          {deleteImageTarget && (
            <div className="space-y-4">
              {/* Preview of the image being deleted */}
              <div className="flex gap-4 items-start bg-muted rounded-lg p-3">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={deleteImageTarget.imageUrl}
                    alt={deleteImageTarget.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{deleteImageTarget.title || 'Untitled'}</p>
                  {deleteImageTarget.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{deleteImageTarget.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Added {new Date(deleteImageTarget.createdAt).toLocaleDateString()}
                  </p>
                  {deleteImageTarget.cloudinaryId && (
                    <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                      ID: {deleteImageTarget.cloudinaryId}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">This action cannot be undone</p>
                    <p className="text-xs text-red-700 mt-1">
                      The image file will be permanently deleted from cloud storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="grid gap-2">
                <Label htmlFor="deleteImageReason">Reason for Removal (Optional)</Label>
                <Textarea
                  id="deleteImageReason"
                  value={deleteImageReason}
                  onChange={(e) => setDeleteImageReason(e.target.value)}
                  placeholder="e.g., Inappropriate content, Copyright violation, Low quality..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be included in the notification sent to the contractor.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteImageDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePortfolioItem}
              disabled={deletingImage}
            >
              {deletingImage ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Image
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

