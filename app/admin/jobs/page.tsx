"use client"

import { useState, useEffect } from "react"
import { Search, Filter, FileText, Eye, AlertTriangle, Clock, CheckCircle, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { adminApi, Job, handleApiError, contractorsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface JobStats {
  totalJobs: number;
  postedJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalValue: number;
  completedValue: number;
  successRate: number;
  recentJobs: Job[];
}

export default function JobOversightPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [flaggedFilter, setFlaggedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [contractors, setContractors] = useState<any[]>([])
  const [assigning, setAssigning] = useState(false)
  const [selectedContractorId, setSelectedContractorId] = useState<string>('')

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 10,
      }

      if (statusFilter !== "all") params.status = statusFilter
      if (categoryFilter !== "all") params.category = categoryFilter
      if (flaggedFilter !== "all") params.flagged = flaggedFilter === "true"
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const response = await adminApi.getAllJobs(params)
      
      // The API returns data in the format { status: 'success', data: { jobs: Job[], pagination: {...} } }
      const jobsData = response.data.jobs as Job[]
      const pagination = response.data.pagination as any
      
      setJobs(jobsData || [])
      setTotalPages(pagination?.pages || 1)
    } catch (error) {
      handleApiError(error, 'Failed to fetch jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await adminApi.getJobStats()
      setStats(statsData)
    } catch (error) {
      handleApiError(error, 'Failed to fetch job statistics')
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [currentPage, statusFilter, categoryFilter, flaggedFilter, searchQuery])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      await adminApi.updateJobStatus(jobId, newStatus)
      toast({
        title: "Success",
        description: "Job status updated successfully",
      })
      fetchJobs() // Refresh the list
    } catch (error) {
      handleApiError(error, 'Failed to update job status')
    }
  }

  const handleFlagToggle = async (jobId: string, flagged: boolean) => {
    try {
      await adminApi.toggleJobFlag(jobId, flagged)
      toast({
        title: "Success",
        description: flagged ? "Job flagged successfully" : "Job flag removed successfully",
      })
      fetchJobs() // Refresh the list
    } catch (error) {
      handleApiError(error, 'Failed to toggle job flag')
    }
  }

  const openDetails = async (job: Job) => {
    setSelectedJob(job)
    setShowDetails(true)
    // Fetch contractors for assignment dropdown
    const res = await contractorsApi.getAll({ limit: 100 })
    setContractors(res.data.contractors)
  }

  const handleAssignContractor = async () => {
    if (!selectedJob || !selectedContractorId) return
    setAssigning(true)
    try {
      await adminApi.assignContractorToJob(selectedJob.id, selectedContractorId)
      toast({ title: 'Success', description: 'Contractor assigned successfully' })
      setShowDetails(false)
      fetchJobs()
    } catch (error) {
      handleApiError(error, 'Failed to assign contractor')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "IN_PROGRESS":
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
      case "POSTED":
        return <Badge variant="secondary">Posted</Badge>
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Quote on request'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Customer', 'Status', 'Budget', 'Location', 'Service', 'Created Date']
    const csvData = jobs.map(job => [
      job.id,
      job.title,
      job.customer?.user?.name || 'N/A',
      job.status,
      job.budget,
      job.location,
      job.service?.name || 'N/A',
      new Date(job.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && !jobs.length) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading jobs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Job Oversight</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor job quality and resolve disputes across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, customers, or contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="POSTED">Posted</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by flags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="true">Flagged Only</SelectItem>
            <SelectItem value="false">Not Flagged</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.inProgressJobs}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.completedJobs}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {stats.postedJobs}
              </div>
              <p className="text-sm text-muted-foreground">Posted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {job.title}
                    {getStatusBadge(job.status)}
                    {job.isUrgent && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  </CardTitle>
                  <CardDescription>
                    {job.service?.name} • {job.location}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetails(job)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Select onValueChange={(value) => handleStatusUpdate(job.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POSTED">Posted</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleFlagToggle(job.id, true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Flag
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{job.customer?.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contractor</p>
                  <p className="text-sm text-muted-foreground">
                    {job.applications?.find(app => app.status === 'ACCEPTED')?.contractor?.businessName || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(job.budget)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {job.description && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </div>
              )}

              {job.isUrgent && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Urgent Job</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    This job has been marked as urgent by the customer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}

      {/* Job Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              {selectedJob?.title} ({getStatusBadge(selectedJob?.status || '')})
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <strong>Customer:</strong> {selectedJob.customer?.user?.name}
              </div>
              <div>
                <strong>Service:</strong> {selectedJob.service?.name}
              </div>
              <div>
                <strong>Location:</strong> {selectedJob.location}
              </div>
              <div>
                <strong>Budget:</strong> {formatCurrency(selectedJob.budget)}
              </div>
              <div>
                <strong>Description:</strong>
                <div className="text-muted-foreground whitespace-pre-line mt-1">{selectedJob.description}</div>
              </div>
              <div>
                <strong>Applications:</strong>
                <ul className="list-disc ml-6">
                  {selectedJob.applications?.map(app => (
                    <li key={app.id}>
                      {app.contractor?.businessName || app.contractor?.user?.name} - {app.status}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Assign Contractor:</strong>
                <Select value={selectedContractorId} onValueChange={setSelectedContractorId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.businessName || c.user?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="mt-2" onClick={handleAssignContractor} disabled={assigning || !selectedContractorId}>
                  {assigning ? 'Assigning...' : 'Assign Contractor'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 