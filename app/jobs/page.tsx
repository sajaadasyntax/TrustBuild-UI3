"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, DollarSign, Search, Briefcase, TrendingUp } from 'lucide-react'
import { jobsApi, servicesApi, handleApiError, Job } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedBudget, setSelectedBudget] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const budgetRanges = [
    { value: 'all', label: 'All Budgets' },
    { value: '0-1000', label: 'Under £1,000' },
    { value: '1000-5000', label: '£1,000 - £5,000' },
    { value: '5000-10000', label: '£5,000 - £10,000' },
    { value: '10000-25000', label: '£10,000 - £25,000' },
    { value: '25000-999999', label: '£25,000+' },
  ]

  const locations = [
    'all',
    'London',
    'Manchester',
    'Birmingham',
    'Leeds',
    'Glasgow',
    'Liverpool',
    'Bristol',
    'Sheffield',
    'Newcastle'
  ]

  useEffect(() => {
    fetchJobs()
    fetchCategories()
  }, [page, selectedCategory, selectedLocation, selectedBudget, searchTerm])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 12,
      }

      if (searchTerm) params.search = searchTerm
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (selectedLocation !== 'all') params.location = selectedLocation
      if (selectedBudget !== 'all') params.budget = selectedBudget

      const response = await jobsApi.getAll(params)
      // Defensive: support both { data: [...] } and { data: { jobs: [...] } }
      let jobsArray: Job[] = [];
      let totalPagesValue = 1;
      if (response.data && typeof response.data === 'object' && 'jobs' in response.data && Array.isArray((response.data as any).jobs)) {
        jobsArray = (response.data as any).jobs;
        totalPagesValue = (response.data as any).pagination?.pages || 1;
      } else if (Array.isArray(response.data)) {
        jobsArray = response.data;
        totalPagesValue = (response.data as any)?.pagination?.pages || 1;
      }
      setJobs(jobsArray);
      setTotalPages(totalPagesValue);
    } catch (error) {
      handleApiError(error, 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await servicesApi.getCategories()
      setCategories(categoriesResponse)
    } catch (error) {
      handleApiError(error, 'Failed to fetch categories')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const formatBudget = (amount?: number) => {
    if (!amount) return 'Quote on request'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatLocation = (job: Job) => {
    // For contractors, only show postcode area until they purchase access
    if (user?.role === 'CONTRACTOR') {
      return job.postcode ? `${job.postcode} area` : 'Area available after purchase'
    }
    // For customers and admins, show full location
    return job.location
  }

  const getUrgencyColor = (isUrgent: boolean) => {
    return isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="container py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Find Your Next Project</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Browse available jobs and apply to the ones that match your skills
        </p>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger>
                <SelectValue placeholder="All Budgets" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedLocation('all')
                setSelectedBudget('all')
                setPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 && !loading ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms to find more opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(Array.isArray(jobs) ? jobs : []).map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={`/jobs/${job.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {job.title}
                      </CardTitle>
                      {job.isUrgent && (
                        <Badge className={getUrgencyColor(job.isUrgent)}>
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {formatLocation(job)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatBudget(job.budget)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">
                        {job.service?.name || 'General'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {job.applications?.length || 0} applications
                      </span>
                      <Badge variant={job.status === 'POSTED' ? 'default' : 'secondary'}>
                        {job.status.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 