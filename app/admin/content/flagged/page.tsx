"use client"

import { useState, useEffect } from "react"
import { Flag, AlertTriangle, Shield, RefreshCw, Check, X, User, Briefcase, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { adminApi, handleApiError } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

interface FlaggedItem {
  id: string
  type: 'review' | 'job_description' | 'profile'
  title: string
  content: string
  author: string
  authorEmail: string
  flaggedBy: string
  flagReason: string
  status: 'pending' | 'approved' | 'removed'
  severity: 'flagged'
  createdDate: Date
  flaggedDate: Date
  // Review specific
  rating?: number
  jobTitle?: string
  contractorName?: string
  // Job specific
  budget?: string
  location?: string
  serviceCategory?: string
}

export default function FlaggedContentPage() {
  const { toast } = useToast()
  const { admin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<FlaggedItem[]>([])
  const [filteredContent, setFilteredContent] = useState<FlaggedItem[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Only fetch when admin auth is complete and admin is authenticated
    if (!authLoading && admin) {
      fetchFlaggedContent()
    }
  }, [authLoading, admin])

  useEffect(() => {
    filterContent()
  }, [content, filterType, searchTerm])

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
      const token = localStorage.getItem('admin_token') // Use correct token name from AdminAuthContext

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${baseUrl}/admin/content/flagged`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch flagged content')
      }

      const data = await response.json()
      setContent(data.data.content || [])
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch flagged content')
    } finally {
      setLoading(false)
    }
  }

  const filterContent = () => {
    let filtered = [...content]

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.content.toLowerCase().includes(search) ||
        item.author.toLowerCase().includes(search)
      )
    }

    setFilteredContent(filtered)
  }

  const handleModerate = async (itemId: string, itemType: string, action: 'approve' | 'remove') => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
      const token = localStorage.getItem('admin_token') // Use correct token name from AdminAuthContext

      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${baseUrl}/admin/content/${itemType}/${itemId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error('Failed to moderate content')
      }

      toast({
        title: "Success",
        description: `Content ${action === 'approve' ? 'approved' : 'removed'} successfully`,
      })

      // Remove the item from the list
      setContent(prev => prev.filter(item => item.id !== itemId))
    } catch (error: any) {
      handleApiError(error, 'Failed to moderate content')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <MessageSquare className="h-4 w-4" />
      case 'job_description':
        return <Briefcase className="h-4 w-4" />
      case 'profile':
        return <User className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'review':
        return 'Review'
      case 'job_description':
        return 'Job Description'
      case 'profile':
        return 'Contractor Profile'
      default:
        return type
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{authLoading ? 'Authenticating...' : 'Loading flagged content...'}</span>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="container py-32">
        <Card>
          <CardContent className="py-20 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You must be logged in as an admin to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-8 w-8 text-destructive" />
              <h1 className="text-3xl font-bold">Flagged Content</h1>
            </div>
            <p className="text-muted-foreground">
              Review and moderate flagged content from the platform
            </p>
          </div>
          <Button onClick={fetchFlaggedContent} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Filter by Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
                <SelectItem value="job_description">Job Descriptions</SelectItem>
                <SelectItem value="profile">Contractor Profiles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{content.length}</div>
              <p className="text-xs text-muted-foreground">Total Flagged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {content.filter(i => i.type === 'review').length}
              </div>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {content.filter(i => i.type === 'job_description').length}
              </div>
              <p className="text-xs text-muted-foreground">Jobs</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {filteredContent.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {content.length === 0 ? 'No Flagged Content' : 'No Results'}
            </h3>
            <p className="text-muted-foreground">
              {content.length === 0
                ? 'There is no flagged content to review at this time.'
                : 'No content matches your current filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(item.type)}
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        FLAGGED
                      </Badge>
                      <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      By {item.author} ({item.authorEmail}) • Flagged: {item.flagReason}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  </div>

                  {/* Type-specific details */}
                  {item.type === 'review' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Rating:</span>{' '}
                        <span className="text-muted-foreground">
                          {"⭐".repeat(item.rating || 0)} ({item.rating}/5)
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Job:</span>{' '}
                        <span className="text-muted-foreground">{item.jobTitle}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Contractor:</span>{' '}
                        <span className="text-muted-foreground">{item.contractorName}</span>
                      </div>
                    </div>
                  )}

                  {item.type === 'job_description' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Budget:</span>{' '}
                        <span className="text-muted-foreground">£{item.budget}</span>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{' '}
                        <span className="text-muted-foreground">{item.location}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Category:</span>{' '}
                        <span className="text-muted-foreground">{item.serviceCategory}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleModerate(item.id, item.type, 'approve')}
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => handleModerate(item.id, item.type, 'remove')}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

