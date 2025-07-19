'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, FileText, AlertTriangle, DollarSign, Clock, CheckCircle, X, Eye, Flag, RefreshCw, Download } from 'lucide-react'
import { adminApi, handleApiError, type Job as ApiJob } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Extended Job interface to match the backend data structure
interface SuperAdminJob extends Omit<ApiJob, 'customer' | 'service' | 'applications'> {
  customer: {
    id: string
    user: {
      id: string
      name: string
      email: string
    }
  }
  service: {
  id: string
    name: string
  category: string
  }
  applications?: Array<{
    id: string
    contractor: {
      user: {
        name: string
      }
    }
  }>
  _count?: {
    applications: number
    reviews: number
  }
  flagged?: boolean
  disputeReason?: string
}

export default function SuperAdminJobManagement() {
  const { user: currentUser, isAuthenticated } = useAuth()
  const [jobs, setJobs] = useState<SuperAdminJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalJobs, setTotalJobs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Job statistics state
  const [stats, setStats] = useState({
    totalJobs: 0,
    postedJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    flaggedJobs: 0,
    totalValue: 0,
    completedValue: 0,
    successRate: 0
  })

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setError('Not authenticated. Please login first.')
      setLoading(false)
      return
    }
    
    if (currentUser?.role !== 'SUPER_ADMIN') {
      setError(`Access denied. You have role: ${currentUser?.role}, but need SUPER_ADMIN role.`)
      setLoading(false)
      return
    }
    
    setError(null)
  }, [isAuthenticated, currentUser])

  // Fetch jobs and stats
  const fetchJobs = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'SUPER_ADMIN') {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching jobs with params:', {
        page: currentPage,
        limit: 20,
        status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchTerm || undefined,
      })

      // Fetch jobs and stats in parallel
      const [jobsResponse, statsResponse] = await Promise.all([
        adminApi.getAllJobs({
          page: currentPage,
          limit: 20,
          status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined,
          category: filterCategory !== 'all' ? filterCategory : undefined,
          search: searchTerm || undefined,
        }),
        adminApi.getJobStats()
      ])
      
      console.log('✅ Jobs API Response received:', jobsResponse)
      console.log('✅ Stats API Response received:', statsResponse)
      
      // Transform the API response to match our interface
      const transformedJobs: SuperAdminJob[] = jobsResponse.data.jobs.map((job: any) => ({
        ...job,
        flagged: false, // Default since we don't have this field in DB yet
        disputeReason: job.status === 'CANCELLED' ? 'Job was cancelled' : undefined,
      }))
      
      console.log('🔄 Transformed jobs:', transformedJobs)
      setJobs(transformedJobs)
      setTotalJobs(jobsResponse.data.pagination.total)
      
      // Update stats
      setStats({
        totalJobs: statsResponse.totalJobs,
        postedJobs: statsResponse.postedJobs,
        inProgressJobs: statsResponse.inProgressJobs,
        completedJobs: statsResponse.completedJobs,
        cancelledJobs: statsResponse.cancelledJobs,
        flaggedJobs: transformedJobs.filter(j => j.flagged).length,
        totalValue: statsResponse.totalValue,
        completedValue: statsResponse.completedValue,
        successRate: statsResponse.successRate
      })
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${transformedJobs.length} jobs`,
      })
    } catch (error) {
      console.error('❌ Error fetching jobs:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch jobs'
      setError(errorMessage)
      handleApiError(error, 'Failed to fetch jobs')
      
      // Additional debugging for common issues
      if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
        toast({
          title: "Authentication Error",
          description: "Please logout and login again with super admin credentials",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterStatus, filterCategory, searchTerm, isAuthenticated, currentUser])

  // Handle job status changes
  const handleStatusChange = async (id: string, newStatus: string, jobTitle: string) => {
    try {
      console.log(`🔄 Changing status for job ${jobTitle} (${id}) to ${newStatus}`)
      await adminApi.updateJobStatus(id, newStatus.toUpperCase())
      
      toast({
        title: "Job Updated",
        description: `Job "${jobTitle}" status changed to ${newStatus.toLowerCase()}`,
      })
      
      // Update local state
    setJobs(jobs.map(job => 
        job.id === id ? { ...job, status: newStatus.toUpperCase() as any } : job
    ))
      
      // Refresh stats
      fetchJobs()
    } catch (error) {
      console.error('❌ Error updating job status:', error)
      handleApiError(error, `Failed to update job status`)
    }
  }

  // Handle job flagging
  const handleToggleFlag = async (id: string, jobTitle: string) => {
    const job = jobs.find(j => j.id === id)
    if (!job) return

    try {
      console.log(`🚩 ${job.flagged ? 'Unflagging' : 'Flagging'} job ${jobTitle} (${id})`)
      await adminApi.toggleJobFlag(id, !job.flagged, 'Admin review')
      
      toast({
        title: "Job Updated",
        description: `Job "${jobTitle}" has been ${job.flagged ? 'unflagged' : 'flagged'}`,
      })
      
      // Update local state
      setJobs(jobs.map(j => 
        j.id === id ? { ...j, flagged: !j.flagged } : j
      ))
    } catch (error) {
      console.error('❌ Error toggling job flag:', error)
      handleApiError(error, 'Failed to update job flag')
    }
  }

  // Handle export jobs
  const handleExportJobs = async () => {
    try {
      setExportLoading(true)
      console.log('📊 Exporting jobs to CSV...')
      
      // Fetch all jobs (without pagination) for export
      const response = await adminApi.getAllJobs({
        limit: 10000, // Get all jobs
        status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchTerm || undefined,
      })
      
      const allJobs = response.data.jobs.map((job: any) => ({
        ...job,
        flagged: false,
      }))
      
      // Create CSV content
      const headers = [
        'ID', 'Title', 'Description', 'Customer', 'Contractor', 'Category', 
        'Status', 'Budget', 'Location', 'Posted Date', 'Completion Date',
        'Applications Count', 'Is Urgent', 'Service Name'
      ]
      
      const csvContent = [
        headers.join(','),
        ...allJobs.map((job: SuperAdminJob) => [
          job.id,
          `"${job.title}"`,
          `"${job.description.substring(0, 100).replace(/"/g, '""')}"`,
          `"${job.customer.user.name}"`,
          job.applications && job.applications.length > 0 ? `"${job.applications[0].contractor.user.name}"` : 'Not assigned',
          job.service.category,
          job.status,
          job.budget,
          `"${job.location}"`,
          new Date(job.createdAt).toLocaleDateString(),
          job.completionDate ? new Date(job.completionDate).toLocaleDateString() : '',
          job._count?.applications || 0,
          job.isUrgent ? 'Yes' : 'No',
          `"${job.service.name}"`
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `trustbuild-jobs-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${allJobs.length} jobs to CSV`,
      })
      
      console.log('✅ Jobs exported successfully')
    } catch (error) {
      console.error('❌ Error exporting jobs:', error)
      handleApiError(error, 'Failed to export jobs')
    } finally {
      setExportLoading(false)
    }
  }

  // Initial load and when dependencies change
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'SUPER_ADMIN') {
      fetchJobs()
    }
  }, [fetchJobs])

  // Filter jobs locally for flagged display
  const filteredJobs = jobs.filter(job => {
    if (showFlaggedOnly && !job.flagged) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      POSTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Show error state if not authenticated or insufficient permissions
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/super-admin" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Super Admin Panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="bg-red-100 p-3 rounded text-sm text-red-800">
              <strong>Debug Info:</strong><br/>
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br/>
              Current User Role: {currentUser?.role || 'None'}<br/>
              Required Role: SUPER_ADMIN<br/>
              Token Present: {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Yes' : 'No'}
            </div>
            <div className="mt-4 space-x-4">
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Login
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>🐛 Debug Info:</strong> Jobs: {jobs.length}, Total: {totalJobs}, Loading: {loading ? 'true' : 'false'}, 
            Auth: {isAuthenticated ? 'Yes' : 'No'}, Role: {currentUser?.role || 'None'}, 
            Token: {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Present' : 'Missing'}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/super-admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Super Admin Panel
          </Link>
          <div className="flex justify-between items-center">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all platform jobs and disputes</p>
            </div>
            <button 
              onClick={fetchJobs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgressJobs}</p>
            <p className="text-sm text-gray-500 mt-1">In progress</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed Jobs</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
            <p className="text-sm text-gray-500 mt-1">Successfully finished</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Platform GMV</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Posted</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.postedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Flagged</h3>
            <p className="text-2xl font-bold text-red-600">{stats.flaggedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Home Renovation">Home Renovation</option>
                <option value="Roofing">Roofing</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Painting">Painting</option>
                <option value="HVAC">HVAC</option>
              </select>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFlaggedOnly}
                  onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Flagged only</span>
              </label>
              <button 
                onClick={handleExportJobs}
                disabled={exportLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${exportLoading ? 'animate-spin' : ''}`} />
                {exportLoading ? 'Exporting...' : 'Export Jobs'}
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading jobs...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className={`hover:bg-gray-50 ${job.flagged ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            {job.flagged && <Flag className="w-4 h-4 text-red-500" />}
                            {job.isUrgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{job.description.substring(0, 60)}...</div>
                        <div className="text-xs text-gray-400 mt-1">
                            {job.service.category} • {job.location}
                        </div>
                        {job.disputeReason && (
                          <div className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                              Issue: {job.disputeReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                          <div className="font-medium">Customer: {job.customer.user.name}</div>
                        <div className="text-gray-500">
                            Contractor: {job.applications && job.applications.length > 0 
                              ? job.applications[0].contractor.user.name 
                              : 'Not assigned'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {job._count?.applications || 0} applications
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={getStatusBadge(job.status)}>
                          {formatStatus(job.status)}
                        </span>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                          {job.budget ? `$${job.budget.toLocaleString()}` : 'Quote on request'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                          <div>Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                        {job.completionDate && (
                          <div className="text-green-600">
                            Completed: {new Date(job.completionDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleToggleFlag(job.id, job.title)}
                          className={`${job.flagged ? 'text-red-600 hover:text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                          title={job.flagged ? 'Remove flag' : 'Flag job'}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                          {job.status === 'POSTED' && (
                          <>
                            <button
                                onClick={() => handleStatusChange(job.id, 'IN_PROGRESS', job.title)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Mark in progress"
                            >
                                <Clock className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleStatusChange(job.id, 'CANCELLED', job.title)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel job"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                          {job.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(job.id, 'COMPLETED', job.title)}
                                className="text-green-600 hover:text-green-900"
                                title="Mark completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                          <button
                                onClick={() => handleStatusChange(job.id, 'CANCELLED', job.title)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel job"
                          >
                            <X className="w-4 h-4" />
                          </button>
                            </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalJobs)} of {totalJobs} jobs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  Page {currentPage} of {Math.ceil(totalJobs / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalJobs / 20)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Resolution Panel */}
        {stats.flaggedJobs > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Flagged Jobs Requiring Attention
            </h3>
            <p className="text-red-700 mb-4">
              {stats.flaggedJobs} job{stats.flaggedJobs > 1 ? 's' : ''} currently flagged for admin review.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.filter(job => job.flagged).map(job => (
                <div key={job.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">Customer: {job.customer.user.name}</p>
                  <p className="text-sm text-gray-600">
                    Contractor: {job.applications && job.applications.length > 0 
                      ? job.applications[0].contractor.user.name 
                      : 'Not assigned'}
                  </p>
                  <p className="text-sm text-red-600 mt-2">{job.disputeReason || 'Flagged for review'}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleToggleFlag(job.id, job.title)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusChange(job.id, 'CANCELLED', job.title)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 