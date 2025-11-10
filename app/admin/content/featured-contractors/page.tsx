"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Search, Eye, Award, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { adminApi } from "@/lib/adminApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

interface Contractor {
  id: string
  user: {
    name: string
    email: string
  }
  businessName?: string
  averageRating: number
  jobsCompleted: number
  services?: Array<{ name: string }>
  city?: string
  featuredContractor: boolean
  createdAt: string
}

export default function FeaturedContractorsPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [filterFeatured, setFilterFeatured] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchContractors = useCallback(async () => {
    if (authLoading || !admin) return
    
    try {
      setLoading(true)
      console.log('📋 Fetching contractors...')
      
      const response = await adminApi.getAllContractors({ limit: 1000 })
      console.log('📋 Contractors response:', response)
      
      const contractorsData = response.data?.contractors || response.contractors || []
      setContractors(contractorsData)
      
      console.log(`📋 Loaded ${contractorsData.length} contractors`)
    } catch (error: any) {
      console.error('❌ Error fetching contractors:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load contractors',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [authLoading, admin, toast])

  useEffect(() => {
    fetchContractors()
  }, [fetchContractors])

  const filteredContractors = contractors.filter((contractor) => {
    const contractorName = contractor.businessName || contractor.user.name
    const matchesSearch = contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.services?.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFeatured = filterFeatured === "all" || 
      (filterFeatured === "featured" && contractor.featuredContractor) ||
      (filterFeatured === "not_featured" && !contractor.featuredContractor)
    return matchesSearch && matchesFeatured
  })

  const handleToggleFeatured = async (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId)
    if (!contractor) return

    try {
      console.log(`🔄 Toggling featured status for contractor ${contractorId}`)
      
      // Call the admin API to update featured status
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
      const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${BASE_URL}/admin/contractors/${contractorId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          featuredContractor: !contractor.featuredContractor
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update featured status')
      }

      // Update local state
      setContractors(prev => 
        prev.map(c => 
          c.id === contractorId 
            ? { ...c, featuredContractor: !c.featuredContractor }
            : c
        )
      )

      toast({
        title: 'Success',
        description: `Contractor ${!contractor.featuredContractor ? 'featured' : 'unfeatured'} successfully`,
      })
      
      console.log('✅ Featured status updated successfully')
    } catch (error: any) {
      console.error('❌ Error toggling featured status:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update featured status',
        variant: 'destructive',
      })
    }
  }

  const featuredCount = contractors.filter(c => c.featuredContractor).length

  if (authLoading || loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Featured Contractors</h1>
        </div>
        <p className="text-muted-foreground">
          Manage which contractors are featured prominently on the platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contractors.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Contractors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {featuredCount}
            </div>
            <p className="text-sm text-muted-foreground">Currently Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {contractors.filter(c => c.averageRating >= 4.8).length}
            </div>
            <p className="text-sm text-muted-foreground">Top Rated (4.8+)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contractors.filter(c => c.jobsCompleted >= 100).length}
            </div>
            <p className="text-sm text-muted-foreground">High Volume (100+ jobs)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={filterFeatured} onValueChange={setFilterFeatured}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contractors</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="not_featured">Not Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contractors List */}
      <div className="space-y-4">
        {filteredContractors.map((contractor) => {
          const contractorName = contractor.businessName || contractor.user.name
          const contractorEmail = contractor.user.email
          return (
            <Card key={contractor.id} className={contractor.featuredContractor ? "border-yellow-200 bg-yellow-50/30" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`https://avatar.vercel.sh/${contractorName}`} />
                      <AvatarFallback>{contractorName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {contractorName}
                        {contractor.featuredContractor && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{contractorEmail}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Featured</span>
                      <Switch
                        checked={contractor.featuredContractor}
                        onCheckedChange={() => handleToggleFeatured(contractor.id)}
                      />
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/contractors/${contractor.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Rating</p>
                    <p className="text-sm text-muted-foreground">⭐ {contractor.averageRating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed Jobs</p>
                    <p className="text-sm text-muted-foreground">{contractor.jobsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{contractor.city || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {contractor.services && contractor.services.length > 0 ? (
                      contractor.services.slice(0, 3).map((service) => (
                        <Badge key={service.name} variant="outline">{service.name}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No services specified</span>
                    )}
                    {contractor.services && contractor.services.length > 3 && (
                      <Badge variant="outline">+{contractor.services.length - 3} more</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Member since: {new Date(contractor.createdAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No contractors found matching your criteria.</p>
        </div>
      )}

      {/* Featured Contractors Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Featured Contractor Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Qualification Criteria</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minimum 4.7 star rating</li>
                <li>• At least 50 completed jobs</li>
                <li>• Verified business credentials</li>
                <li>• Active within last 30 days</li>
                <li>• No recent complaints or disputes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Featured Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Priority placement in search results</li>
                <li>• Featured badge on profile</li>
                <li>• Inclusion in homepage carousel</li>
                <li>• Enhanced visibility in job matching</li>
                <li>• Access to premium analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
