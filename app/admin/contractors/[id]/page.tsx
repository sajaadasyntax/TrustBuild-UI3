"use client"

import { useState, useEffect } from 'react'
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
  Award
} from 'lucide-react'
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
      const foundContractor = response.contractors.find((c: Contractor) => c.id === contractorId)
      
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

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{contractor.jobsCompleted || contractor.totalJobs || 0}</div>
                  <div className="text-xs text-muted-foreground">Jobs Completed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    {contractor.averageRating?.toFixed(1) || contractor.rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{contractor.reviewCount || 0}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
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
    </div>
  )
}

