"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Search, Eye, Award, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

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
  const { loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [filterFeatured, setFilterFeatured] = useState("all")
  const [loading, setLoading] = useState(true)

  // Properly construct API URL
  const getApiUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
    return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
  }

  const fetchContractors = useCallback(async () => {
    if (authLoading) return
    
    try {
      const API_BASE_URL = getApiUrl()
      const response = await fetch(`${API_BASE_URL}/admin/contractors`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch contractors')

      const data = await response.json()
      setContractors(data.data?.contractors || [])
    } catch (error) {
      console.error('Error fetching contractors:', error)
      toast({
        title: 'Error',
        description: 'Failed to load contractors',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [authLoading, toast])

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
      const API_BASE_URL = getApiUrl()
      const response = await fetch(`${API_BASE_URL}/admin/contractors/${contractorId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          featuredContractor: !contractor.featuredContractor
        }),
      })

      if (!response.ok) throw new Error('Failed to update featured status')

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
    } catch (error) {
      console.error('Error toggling featured status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive',
      })
    }
  }

  const featuredCount = contractors.filter(c => c.featuredContractor).length

  if (loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                      <a href={`/contractors/${contractor.id}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </a>
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