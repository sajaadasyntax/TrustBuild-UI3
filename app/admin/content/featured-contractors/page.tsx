"use client"

import { useState } from "react"
import { Star, Search, Eye, Award, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

// Mock data
const mockContractors = [
  {
    id: "1",
    name: "Smith & Sons Builders",
    email: "contact@smithsons.co.uk",
    rating: 4.9,
    completedJobs: 156,
    specialties: ["Kitchen Renovation", "Home Extensions"],
    location: "London, UK",
    isFeatured: true,
    joinedDate: "2022-01-15",
    revenue: 89500,
  },
  {
    id: "2",
    name: "Modern Interiors Ltd",
    email: "info@moderninteriors.com",
    rating: 4.8,
    completedJobs: 143,
    specialties: ["Bathroom Remodeling", "Interior Design"],
    location: "Manchester, UK",
    isFeatured: true,
    joinedDate: "2022-03-20",
    revenue: 76200,
  },
  {
    id: "3",
    name: "Elite Construction Co",
    email: "hello@eliteconstruction.com",
    rating: 4.8,
    completedJobs: 134,
    specialties: ["General Construction", "Commercial Work"],
    location: "Birmingham, UK",
    isFeatured: false,
    joinedDate: "2021-11-10",
    revenue: 92100,
  },
  {
    id: "4",
    name: "Premium Home Solutions",
    email: "contact@premiumhome.co.uk",
    rating: 4.7,
    completedJobs: 128,
    specialties: ["Luxury Renovations", "Custom Builds"],
    location: "Leeds, UK",
    isFeatured: true,
    joinedDate: "2022-06-05",
    revenue: 71800,
  },
  {
    id: "5",
    name: "Expert Renovations",
    email: "info@expertrenovations.com",
    rating: 4.7,
    completedJobs: 122,
    specialties: ["Home Renovations", "Restoration"],
    location: "Bristol, UK",
    isFeatured: false,
    joinedDate: "2022-02-28",
    revenue: 68900,
  },
]

export default function FeaturedContractorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [contractors, setContractors] = useState(mockContractors)
  const [filterFeatured, setFilterFeatured] = useState("all")

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFeatured = filterFeatured === "all" || 
      (filterFeatured === "featured" && contractor.isFeatured) ||
      (filterFeatured === "not_featured" && !contractor.isFeatured)
    return matchesSearch && matchesFeatured
  })

  const handleToggleFeatured = (contractorId: string) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === contractorId 
          ? { ...contractor, isFeatured: !contractor.isFeatured }
          : contractor
      )
    )
  }

  const featuredCount = contractors.filter(c => c.isFeatured).length

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
              {contractors.filter(c => c.rating >= 4.8).length}
            </div>
            <p className="text-sm text-muted-foreground">Top Rated (4.8+)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {contractors.filter(c => c.completedJobs >= 100).length}
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
        {filteredContractors.map((contractor) => (
          <Card key={contractor.id} className={contractor.isFeatured ? "border-yellow-200 bg-yellow-50/30" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${contractor.name}`} />
                    <AvatarFallback>{contractor.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {contractor.name}
                      {contractor.isFeatured && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{contractor.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Featured</span>
                    <Switch
                      checked={contractor.isFeatured}
                      onCheckedChange={() => handleToggleFeatured(contractor.id)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <p className="text-sm text-muted-foreground">⭐ {contractor.rating}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Completed Jobs</p>
                  <p className="text-sm text-muted-foreground">{contractor.completedJobs}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-sm text-muted-foreground">£{contractor.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{contractor.location}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline">{specialty}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Member since: {contractor.joinedDate}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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