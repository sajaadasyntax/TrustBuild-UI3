"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, FileText, Eye, AlertTriangle, Clock, CheckCircle, Download, RefreshCw, PoundSterling, DollarSign, User, Phone, Mail, Calendar, MapPin, Star, Users, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { adminApi, Job, handleApiError, contractorsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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

// Helper function to check admin permissions
function hasPermission(userPermissions: string[] | null | undefined, required: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(required);
}

function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false;
  return required.some(perm => userPermissions.includes(perm));
}

export default function JobOversightPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const permissions = admin?.permissions || []
  const canWriteJobs = isSuperAdmin || hasPermission(permissions, 'jobs:write')
  const canWritePricing = isSuperAdmin || hasPermission(permissions, 'pricing:write')
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
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState({
    currentLeadPrice: 0,
    reason: ''
  });
  const [editingBudget, setEditingBudget] = useState({
    budget: 0,
    reason: ''
  });
  const [editingContractorLimit, setEditingContractorLimit] = useState({
    maxContractorsPerJob: 5,
    reason: ''
  });
  const [showContractorLimitDialog, setShowContractorLimitDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [contractors, setContractors] = useState<any[]>([])
  const [assigning, setAssigning] = useState(false)
  const [selectedContractorId, setSelectedContractorId] = useState<string>('')

  const fetchJobs = useCallback(async () => {
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
  }, [currentPage, statusFilter, categoryFilter, flaggedFilter, searchQuery])

  const fetchStats = async () => {
    try {
      const statsData = await adminApi.getJobStats()
      setStats(statsData)
    } catch (error) {
      handleApiError(error, 'Failed to fetch job statistics')
    }
  }

  useEffect(() => {
    // Wait for authentication to be ready before fetching data
    if (!authLoading) {
      fetchJobs()
    }
  }, [fetchJobs, authLoading])

  useEffect(() => {
    // Wait for authentication to be ready before fetching stats
    if (!authLoading) {
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

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

  const openFlagDialog = (job: Job) => {
    setSelectedJob(job)
    setFlagReason('')
    setShowFlagDialog(true)
  }

  const handleFlagToggle = async (jobId: string, flagged: boolean, reason?: string) => {
    try {
      await adminApi.toggleJobFlag(jobId, flagged, reason)
      toast({
        title: "Success",
        description: flagged ? "Job flagged successfully" : "Job flag removed successfully",
      })
      setShowFlagDialog(false)
      setFlagReason('')
      fetchJobs() // Refresh the list
    } catch (error) {
      handleApiError(error, 'Failed to toggle job flag')
    }
  }

  const openDetails = (job: Job) => {
    setSelectedJob(job)
    setShowDetails(true)
  }

  const openPriceDialog = (job: Job) => {
    setSelectedJob(job)
    setEditingPrice({
      currentLeadPrice: job.currentLeadPrice || 0,
      reason: ''
    })
    setShowPriceDialog(true)
  }

  const openBudgetDialog = (job: Job) => {
    setSelectedJob(job)
    setEditingBudget({
      budget: job.budget || 0,
      reason: ''
    })
    setShowBudgetDialog(true)
  }
  
  const openContractorLimitDialog = (job: Job) => {
    setSelectedJob(job)
    setEditingContractorLimit({
      maxContractorsPerJob: job.maxContractorsPerJob || 5,
      reason: ''
    })
    setShowContractorLimitDialog(true)
  }

  const handlePriceUpdate = async () => {
    if (!selectedJob) return;
    
    try {
      setLoading(true);
      await adminApi.setJobLeadPrice(selectedJob.id, editingPrice.currentLeadPrice, editingPrice.reason);
      
      // Refresh jobs data
      await fetchJobs();
      
      setShowPriceDialog(false);
      setEditingPrice({ currentLeadPrice: 0, reason: '' });
      
      // Show success message
      toast({
        title: "Price Updated",
        description: `Job lead price updated to ${formatCurrency(editingPrice.currentLeadPrice)}`,
      })
    } catch (error) {
      handleApiError(error, 'Failed to update job price')
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = async () => {
    if (!selectedJob) return;
    
    try {
      setLoading(true);
      await adminApi.setJobBudget(selectedJob.id, editingBudget.budget, editingBudget.reason);
      
      // Refresh jobs data
      await fetchJobs();
      
      setShowBudgetDialog(false);
      setEditingBudget({ budget: 0, reason: '' });
      
      // Show success message
      toast({
        title: "Budget Updated",
        description: `Job budget updated to ${formatCurrency(editingBudget.budget)}`,
      })
    } catch (error) {
      handleApiError(error, 'Failed to update job budget')
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine if the contractor limit update button should be disabled
  const isContractorLimitUpdateDisabled = (): boolean => {
    // Check if reason is empty
    const isReasonEmpty = editingContractorLimit.reason === '';
    
    // Check if max contractors is less than 1
    const isMaxContractorsTooLow = editingContractorLimit.maxContractorsPerJob < 1;
    
    // Check if max contractors is less than current contractors with access
    let isMaxLessThanCurrent = false;
    if (selectedJob) {
      const currentContractors = selectedJob.contractorsWithAccess || 0;
      isMaxLessThanCurrent = editingContractorLimit.maxContractorsPerJob < currentContractors;
    }
    
    // Return true if any condition is met (button should be disabled)
    return isReasonEmpty || isMaxContractorsTooLow || isMaxLessThanCurrent;
  };

  const handleContractorLimitUpdate = async () => {
    if (!selectedJob) return;
    
    try {
      setLoading(true);
      await adminApi.updateJobContractorLimit(
        selectedJob.id, 
        editingContractorLimit.maxContractorsPerJob,
        editingContractorLimit.reason
      );
      
      // Refresh jobs data
      await fetchJobs();
      
      setShowContractorLimitDialog(false);
      setEditingContractorLimit({ maxContractorsPerJob: 5, reason: '' });
      
      // Show success message
      toast({
        title: "Contractor Limit Updated",
        description: `Job contractor limit updated to ${editingContractorLimit.maxContractorsPerJob} contractors`,
      })
    } catch (error) {
      handleApiError(error, 'Failed to update contractor limit')
    } finally {
      setLoading(false);
    }
  };

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
    if (!amount) return 'N/A'
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
          <Download className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Export CSV</span>
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
                    {job.isFlagged && (
                      <Badge variant="destructive" className="bg-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
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
                  {canWritePricing && (
                    <Button variant="outline" size="sm" onClick={() => openPriceDialog(job)}>
                      <PoundSterling className="h-4 w-4 mr-1" />
                      Edit Lead Price
                    </Button>
                  )}
                  {canWriteJobs && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openBudgetDialog(job)}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Edit Budget
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openContractorLimitDialog(job)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Contractor Limit
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
                    </>
                  )}
                  {canWriteJobs && job.isFlagged ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFlagToggle(job.id, false)}
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Unflag
                    </Button>
                  ) : canWriteJobs ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openFlagDialog(job)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                  ) : null}
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium">Lead Price</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {job.currentLeadPrice ? formatCurrency(job.currentLeadPrice) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Job Size</p>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant={job.jobSize === 'LARGE' ? 'destructive' : job.jobSize === 'MEDIUM' ? 'default' : 'secondary'}>
                      {job.jobSize || 'Not classified'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contractor Limit</p>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="outline" className={(job.contractorsWithAccess || 0) >= (job.maxContractorsPerJob || 5) ? 'bg-red-100 text-red-800' : ''}>
                      {job.contractorsWithAccess || 0}/{job.maxContractorsPerJob || 5} contractors
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Service</p>
                  <p className="text-sm text-muted-foreground">{job.service?.name || 'N/A'}</p>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job Details
            </DialogTitle>
            <DialogDescription>
              {selectedJob?.title} ({getStatusBadge(selectedJob?.status || '')})
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="contractors">Contractors</TabsTrigger>
                <TabsTrigger value="admin">Admin Actions</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <strong>Service:</strong> {selectedJob.service?.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <strong>Location:</strong> {selectedJob.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <strong>Budget:</strong> {formatCurrency(selectedJob.budget)}
                    </div>
                    <div className="flex items-center gap-2">
                      <PoundSterling className="h-4 w-4 text-muted-foreground" />
                      <strong>Lead Price:</strong> {selectedJob.currentLeadPrice ? formatCurrency(selectedJob.currentLeadPrice) : 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <strong>Job Size:</strong> 
                      <Badge variant={selectedJob.jobSize === 'LARGE' ? 'destructive' : selectedJob.jobSize === 'MEDIUM' ? 'default' : 'secondary'} className="ml-2">
                        {selectedJob.jobSize || 'Not classified'}
                      </Badge>
                    </div>
                    <div>
                      <strong>Contractor Limit:</strong>
                      <Badge variant="outline" className={`ml-2 ${(selectedJob.contractorsWithAccess || 0) >= (selectedJob.maxContractorsPerJob || 5) ? 'bg-red-100 text-red-800' : ''}`}>
                        {selectedJob.contractorsWithAccess || 0}/{selectedJob.maxContractorsPerJob || 5} contractors
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <strong>Posted:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <strong>Description:</strong>
                  <div className="text-muted-foreground whitespace-pre-line mt-1 p-3 bg-muted rounded-lg">{selectedJob.description}</div>
                </div>
                
                {selectedJob.notes && (
                  <div>
                    <strong>Customer Notes:</strong>
                    <div className="text-muted-foreground whitespace-pre-line mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">{selectedJob.notes}</div>
                  </div>
                )}
                
                {selectedJob.isFlagged && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <strong>Job Flagged for Review</strong>
                    </div>
                    {selectedJob.flagReason && (
                      <div>
                        <p className="text-sm font-medium text-red-700">Reason:</p>
                        <p className="text-sm text-red-600 mt-1">{selectedJob.flagReason}</p>
                      </div>
                    )}
                    {selectedJob.flaggedAt && (
                      <p className="text-xs text-red-500 mt-2">
                        Flagged on {new Date(selectedJob.flaggedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
              
              {/* Customer Tab - Full Customer Details */}
              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <strong>Name:</strong> {selectedJob.customer?.user?.name || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <strong>Email:</strong> 
                          <a href={`mailto:${selectedJob.customer?.user?.email}`} className="text-blue-600 hover:underline">
                            {selectedJob.customer?.user?.email || 'N/A'}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <strong>Phone:</strong> 
                          {selectedJob.customer?.phone ? (
                            <a href={`tel:${selectedJob.customer.phone}`} className="text-blue-600 hover:underline font-semibold">
                              {selectedJob.customer.phone}
                            </a>
                          ) : 'Not provided'}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <strong>Address:</strong> {selectedJob.location || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <strong>Customer Since:</strong> {selectedJob.customer?.user?.createdAt ? new Date(selectedJob.customer.user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contractors Tab - All contractor activity */}
              <TabsContent value="contractors" className="space-y-4">
                {/* Winning Contractor */}
                {selectedJob.wonByContractor && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Selected Contractor (Winner)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Business Name:</strong> {selectedJob.wonByContractor.businessName || 'N/A'}
                        </div>
                        <div>
                          <strong>Contact Name:</strong> {selectedJob.wonByContractor.user?.name || 'N/A'}
                        </div>
                        <div>
                          <strong>Email:</strong> 
                          {selectedJob.wonByContractor.user?.email ? (
                            <a href={`mailto:${selectedJob.wonByContractor.user.email}`} className="text-blue-600 hover:underline ml-1">
                              {selectedJob.wonByContractor.user.email}
                            </a>
                          ) : ' N/A'}
                        </div>
                        <div>
                          <strong>Phone:</strong> 
                          {selectedJob.wonByContractor.phone ? (
                            <a href={`tel:${selectedJob.wonByContractor.phone}`} className="text-blue-600 hover:underline font-semibold ml-1">
                              {selectedJob.wonByContractor.phone}
                            </a>
                          ) : ' N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Contractors with Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Contractors Who Purchased Access ({selectedJob.purchasedBy?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      These contractors have paid to view customer details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedJob.purchasedBy && selectedJob.purchasedBy.length > 0 ? (
                      <div className="space-y-3">
                        {selectedJob.purchasedBy.map((contractor, index) => (
                          <div key={contractor.contractorId || index} className="p-3 border rounded-lg bg-white">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="font-semibold">{contractor.contractorName}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {contractor.averageRating?.toFixed(1) || 'No rating'} • {contractor.reviewCount || 0} reviews
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {contractor.jobsCompleted || 0} jobs completed
                                </div>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <div>Purchased: {new Date(contractor.purchasedAt).toLocaleDateString()}</div>
                                {contractor.paidAmount && (
                                  <div className="font-medium">{formatCurrency(contractor.paidAmount)}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No contractors have purchased access yet</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Applications (if any) */}
                {selectedJob.applications && selectedJob.applications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        Applications ({selectedJob.applications.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedJob.applications.map(app => (
                          <div key={app.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">{app.contractor?.businessName || app.contractor?.user?.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Proposed: {formatCurrency(app.proposedRate)}
                                  {app.timeline && ` • Timeline: ${app.timeline}`}
                                </div>
                              </div>
                              <Badge variant={app.status === 'ACCEPTED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                {app.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Admin Actions Tab */}
              <TabsContent value="admin" className="space-y-4">

              {/* Admin Override Controls - Now in the admin tab */}
              {canWriteJobs && (
                  <div className="space-y-3">
                    {/* Approve Winner */}
                    {selectedJob.status === 'POSTED' && selectedJob.applications && selectedJob.applications.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium mb-2">Approve Contractor Winner</p>
                        <Select value={selectedContractorId} onValueChange={setSelectedContractorId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select contractor" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedJob.applications.map(app => (
                              <SelectItem key={app.id} value={app.contractorId}>
                                {app.contractor?.businessName || app.contractor?.user?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="mt-2 w-full"
                          size="sm"
                          onClick={async () => {
                            if (!selectedContractorId) {
                              toast({ title: "Error", description: "Please select a contractor", variant: "destructive" });
                              return;
                            }
                            try {
                              await adminApi.adminApproveWinner(selectedJob.id, selectedContractorId, 'Admin override');
                              toast({ title: "Success", description: "Contractor approved as winner" });
                              fetchJobs();
                              setShowDetails(false);
                            } catch (error) {
                              handleApiError(error, 'Failed to approve winner');
                            }
                          }}
                          disabled={assigning}
                        >
                          {assigning ? 'Processing...' : 'Approve Winner'}
                        </Button>
                      </div>
                    )}

                    {/* Lock/Unlock Job */}
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium mb-2">Lock/Unlock Job</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Locking prevents contractors from applying. Unlocking allows applications again.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await adminApi.adminLockJob(selectedJob.id, true, 'Admin override - Job locked');
                              toast({ title: "Success", description: "Job locked" });
                              fetchJobs();
                              setShowDetails(false);
                            } catch (error) {
                              handleApiError(error, 'Failed to lock job');
                            }
                          }}
                        >
                          Lock Job
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await adminApi.adminLockJob(selectedJob.id, false, 'Admin override - Job unlocked');
                              toast({ title: "Success", description: "Job unlocked" });
                              fetchJobs();
                              setShowDetails(false);
                            } catch (error) {
                              handleApiError(error, 'Failed to unlock job');
                            }
                          }}
                        >
                          Unlock Job
                        </Button>
                      </div>
                    </div>

                    {/* Mark as Completed */}
                    {selectedJob.status === 'IN_PROGRESS' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium mb-2">Mark Job as Completed</p>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Final amount"
                          className="mb-2"
                          onChange={(e) => setEditingBudget({ ...editingBudget, budget: parseFloat(e.target.value) || 0 })}
                        />
                        <Textarea
                          placeholder="Reason for override"
                          rows={2}
                          className="mb-2"
                          value={editingBudget.reason}
                          onChange={(e) => setEditingBudget({ ...editingBudget, reason: e.target.value })}
                        />
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={async () => {
                            if (!editingBudget.budget || !editingBudget.reason) {
                              toast({ title: "Error", description: "Please provide amount and reason", variant: "destructive" });
                              return;
                            }
                            try {
                              await adminApi.adminMarkCompleted(selectedJob.id, editingBudget.budget, editingBudget.reason);
                              toast({ title: "Success", description: "Job marked as completed" });
                              fetchJobs();
                              setShowDetails(false);
                            } catch (error) {
                              handleApiError(error, 'Failed to mark job as completed');
                            }
                          }}
                        >
                          Mark as Completed
                        </Button>
                      </div>
                    )}

                    {/* Allow Review Request */}
                    {selectedJob.status === 'COMPLETED' && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium mb-2">Allow Contractor to Request Review</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Use this if the customer is inactive and the contractor needs to request a review.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            try {
                              await adminApi.adminAllowReviewRequest(selectedJob.id, 'Admin override - Allowing review request');
                              toast({ title: "Success", description: "Contractor can now request review" });
                              fetchJobs();
                              setShowDetails(false);
                            } catch (error) {
                              handleApiError(error, 'Failed to allow review request');
                            }
                          }}
                        >
                          Allow Review Request
                        </Button>
                      </div>
                    )}
                  </div>
              )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Price Edit Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Lead Price</DialogTitle>
            <DialogDescription>
              Adjust the lead access price for &ldquo;{selectedJob?.title}&rdquo;
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPrice">Current Budget</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Customer budget: {formatCurrency(selectedJob?.budget || 0)}
              </p>
            </div>
            
            <div>
              <Label htmlFor="leadPrice">Lead Access Price</Label>
              <Input
                id="leadPrice"
                type="number"
                step="0.01"
                min="0"
                value={editingPrice.currentLeadPrice}
                onChange={(e) => setEditingPrice(prev => ({ 
                  ...prev, 
                  currentLeadPrice: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Enter lead price..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Price contractors pay to access this job lead
              </p>
            </div>
            
            <div>
              <Label htmlFor="priceReason">Reason for Price Adjustment</Label>
              <Textarea
                id="priceReason"
                value={editingPrice.reason}
                onChange={(e) => setEditingPrice(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why the price is being adjusted..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPriceDialog(false)
                  setEditingPrice({ currentLeadPrice: 0, reason: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePriceUpdate}
                disabled={!editingPrice.reason.trim() || editingPrice.currentLeadPrice < 0}
              >
                Update Price
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Budget Edit Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Budget</DialogTitle>
            <DialogDescription>
              Adjust the customer budget for &ldquo;{selectedJob?.title}&rdquo;
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentBudget">Current Budget</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Current: {formatCurrency(selectedJob?.budget || 0)}
              </p>
            </div>
            
            <div>
              <Label htmlFor="newBudget">New Budget</Label>
              <Input
                id="newBudget"
                type="number"
                step="0.01"
                min="0"
                value={editingBudget.budget}
                onChange={(e) => setEditingBudget(prev => ({ 
                  ...prev, 
                  budget: parseFloat(e.target.value) || 0 
                }))}
                placeholder="Enter new budget..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Amount the customer&apos;s willing to pay for this job
              </p>
            </div>
            
            <div>
              <Label htmlFor="budgetReason">Reason for Budget Adjustment</Label>
              <Textarea
                id="budgetReason"
                value={editingBudget.reason}
                onChange={(e) => setEditingBudget(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this budget adjustment is needed..."
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBudgetUpdate}
              disabled={!editingBudget.reason.trim()}
            >
              Update Budget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contractor Limit Dialog */}
      <Dialog open={showContractorLimitDialog} onOpenChange={setShowContractorLimitDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contractor Limit</DialogTitle>
            <DialogDescription>
              Set how many contractors can purchase access to &ldquo;{selectedJob?.title}&rdquo;
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentLimit">Current Status</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Currently: {selectedJob?.contractorsWithAccess || 0} of {selectedJob?.maxContractorsPerJob || 5} contractors have purchased access
              </p>
            </div>
            
            <div>
              <Label htmlFor="contractorLimit">Maximum Contractors</Label>
              <Input
                id="contractorLimit"
                type="number"
                min="1"
                value={editingContractorLimit.maxContractorsPerJob}
                onChange={(e) => setEditingContractorLimit(prev => ({ 
                  ...prev, 
                  maxContractorsPerJob: parseInt(e.target.value) || 1
                }))}
                placeholder="Enter maximum contractors..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of contractors who can purchase access to this job
              </p>
              {selectedJob && editingContractorLimit.maxContractorsPerJob < (selectedJob.contractorsWithAccess || 0) && (
                <p className="text-xs text-red-600 mt-1">
                  Warning: Cannot set limit below current contractor count ({selectedJob.contractorsWithAccess})
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="limitReason">Reason for Limit Change</Label>
              <Textarea
                id="limitReason"
                value={editingContractorLimit.reason}
                onChange={(e) => setEditingContractorLimit(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why the contractor limit is being changed..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowContractorLimitDialog(false)
                  setEditingContractorLimit({ maxContractorsPerJob: 5, reason: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContractorLimitUpdate}
                disabled={isContractorLimitUpdateDisabled()}
              >
                Update Limit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flag Job Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flag Job for Review</DialogTitle>
            <DialogDescription>
              Flag &ldquo;{selectedJob?.title}&rdquo; for admin review
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="flagReason">Reason for Flagging</Label>
              <Textarea
                id="flagReason"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Explain why this job needs to be flagged for review..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide details about any suspicious activity, policy violations, or issues
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFlagDialog(false)
                  setFlagReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedJob && handleFlagToggle(selectedJob.id, true, flagReason)}
                disabled={!flagReason.trim()}
                variant="destructive"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Flag Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 