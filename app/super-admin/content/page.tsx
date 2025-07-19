'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Flag, AlertTriangle, Eye, CheckCircle, X, MessageSquare, Image, FileText, RefreshCw, Download, User } from 'lucide-react'
import { adminApi, handleApiError } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface ContentItem {
  id: string
  type: 'review' | 'job_description' | 'profile' | 'message' | 'image'
  title: string
  content: string
  author: string
  authorEmail?: string
  flaggedBy: string
  flagReason: string
  status: 'pending' | 'approved' | 'rejected'
  severity: 'low' | 'medium' | 'high'
  createdDate: string
  flaggedDate: string
  // Additional fields from backend
  rating?: number
  jobTitle?: string
  contractorName?: string
  budget?: number
  location?: string
  serviceCategory?: string
  businessName?: string
  profileApproved?: boolean
}

export default function SuperAdminContentModeration() {
  const { user: currentUser, isAuthenticated } = useAuth()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [exportLoading, setExportLoading] = useState(false)

  const [stats, setStats] = useState({
    totalFlagged: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    reviewCount: 0,
    jobCount: 0,
    profileCount: 0
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

  // Fetch flagged content
  const fetchContent = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'SUPER_ADMIN') {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching flagged content with params:', {
        page: currentPage,
        limit: 20,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        search: searchTerm || undefined,
      })

      const response = await adminApi.getFlaggedContent({
        page: currentPage,
        limit: 20,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        search: searchTerm || undefined,
      })
      
      console.log('✅ Content API Response received:', response)
      
      setContentItems(response.content)
      setStats(response.stats)
      setTotalItems(response.pagination.total)
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${response.content.length} flagged items`,
      })
    } catch (error) {
      console.error('❌ Error fetching content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content'
      setError(errorMessage)
      handleApiError(error, 'Failed to fetch flagged content')
      
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
  }, [currentPage, filterType, filterStatus, filterSeverity, searchTerm, isAuthenticated, currentUser])

  // Handle content moderation
  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected', contentType: string, title: string) => {
    try {
      console.log(`🔄 ${newStatus === 'approved' ? 'Approving' : 'Rejecting'} ${contentType} ${title} (${id})`)
      const action = newStatus === 'approved' ? 'approve' : 'reject'
      await adminApi.moderateContent(contentType, id, action, `Admin ${newStatus} content`)
      
      toast({
        title: "Content Moderated",
        description: `Content "${title}" has been ${newStatus}`,
      })
      
      // Update local state
      setContentItems(contentItems.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ))
      
      // Refresh data to get updated stats
      fetchContent()
    } catch (error) {
      console.error('❌ Error moderating content:', error)
      handleApiError(error, `Failed to ${newStatus} content`)
    }
  }

  // Handle content deletion
  const handleDeleteContent = async (id: string, contentType: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      console.log(`🗑️ Deleting ${contentType} ${title} (${id})`)
      await adminApi.moderateContent(contentType, id, 'delete', 'Admin deleted content')
      
      toast({
        title: "Content Deleted",
        description: `Content "${title}" has been permanently deleted`,
      })
      
      // Remove from local state
      setContentItems(contentItems.filter(item => item.id !== id))
      
      // Refresh data to get updated stats
      fetchContent()
    } catch (error) {
      console.error('❌ Error deleting content:', error)
      handleApiError(error, 'Failed to delete content')
    }
  }

  // Handle export content
  const handleExportContent = async () => {
    try {
      setExportLoading(true)
      console.log('📊 Exporting flagged content to CSV...')
      
      // Fetch all content (without pagination) for export
      const response = await adminApi.getFlaggedContent({
        limit: 10000, // Get all content
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        search: searchTerm || undefined,
      })
      
      const allContent = response.content
      
      // Create CSV content
      const headers = [
        'ID', 'Type', 'Title', 'Content', 'Author', 'Author Email', 'Flagged By', 
        'Flag Reason', 'Status', 'Severity', 'Created Date', 'Flagged Date',
        'Rating', 'Budget', 'Location', 'Service Category'
      ]
      
      const csvContent = [
        headers.join(','),
        ...allContent.map((item: ContentItem) => [
          item.id,
          item.type,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.content.substring(0, 200).replace(/"/g, '""')}"`,
          `"${item.author}"`,
          item.authorEmail || '',
          `"${item.flaggedBy}"`,
          `"${item.flagReason.replace(/"/g, '""')}"`,
          item.status,
          item.severity,
          new Date(item.createdDate).toLocaleDateString(),
          new Date(item.flaggedDate).toLocaleDateString(),
          item.rating || '',
          item.budget || '',
          item.location || '',
          item.serviceCategory || ''
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `trustbuild-flagged-content-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${allContent.length} flagged items to CSV`,
      })
      
      console.log('✅ Content exported successfully')
    } catch (error) {
      console.error('❌ Error exporting content:', error)
      handleApiError(error, 'Failed to export content')
    } finally {
      setExportLoading(false)
    }
  }

  // Initial load and when dependencies change
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'SUPER_ADMIN') {
      fetchContent()
    }
  }, [fetchContent])

  const getStatusBadge = (status: ContentItem['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`
  }

  const getSeverityBadge = (severity: ContentItem['severity']) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[severity]}`
  }

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'review':
        return <MessageSquare className="w-4 h-4" />
      case 'job_description':
        return <FileText className="w-4 h-4" />
      case 'profile':
        return <User className="w-4 h-4" />
      case 'message':
        return <MessageSquare className="w-4 h-4" />
      case 'image':
        return <Image className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const formatType = (type: ContentItem['type']) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
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
            <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
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
            <strong>🐛 Debug Info:</strong> Content: {contentItems.length}, Total: {totalItems}, Loading: {loading ? 'true' : 'false'}, 
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
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
              <p className="text-gray-600 mt-2">Review flagged content and manage platform safety</p>
            </div>
            <button 
              onClick={fetchContent}
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
            <h3 className="text-sm font-medium text-gray-500">Total Flagged</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFlagged}</p>
            <p className="text-sm text-gray-500 mt-1">All content</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting decision</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">High Priority</h3>
            <p className="text-2xl font-bold text-red-600">{stats.highSeverity}</p>
            <p className="text-sm text-gray-500 mt-1">Urgent attention</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Content Types</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.reviewCount + stats.jobCount + stats.profileCount}</p>
            <p className="text-sm text-gray-500 mt-1">Reviews, Jobs, Profiles</p>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Low Severity</h3>
            <p className="text-2xl font-bold text-gray-600">{stats.lowSeverity}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Medium Severity</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.mediumSeverity}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">High Severity</h3>
            <p className="text-2xl font-bold text-red-600">{stats.highSeverity}</p>
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
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="review">Reviews</option>
                <option value="job_description">Job Descriptions</option>
                <option value="profile">Profiles</option>
                <option value="message">Messages</option>
                <option value="image">Images</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExportContent}
                disabled={exportLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${exportLoading ? 'animate-spin' : ''}`} />
                {exportLoading ? 'Exporting...' : 'Export Content'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Items */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading flagged content...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {contentItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
                item.severity === 'high' ? 'border-l-red-500' : 
                item.severity === 'medium' ? 'border-l-orange-500' : 
                'border-l-gray-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium text-gray-900">{formatType(item.type)}</span>
                      </div>
                      <span className={getStatusBadge(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <span className={getSeverityBadge(item.severity)}>
                        {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-gray-700 text-sm">{item.content.substring(0, 300)}...</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Author:</span> {item.author}
                      </div>
                      <div>
                        <span className="font-medium">Flagged by:</span> {item.flaggedBy}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {new Date(item.createdDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Flagged:</span> {new Date(item.flaggedDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Additional details based on content type */}
                    {item.type === 'review' && item.rating && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Rating:</span> {item.rating}/5 stars
                        {item.jobTitle && <span> • <span className="font-medium">Job:</span> {item.jobTitle}</span>}
                      </div>
                    )}
                    {item.type === 'job_description' && (
                      <div className="text-sm text-gray-600 mb-2">
                        {item.budget && <span><span className="font-medium">Budget:</span> ${item.budget.toLocaleString()} • </span>}
                        {item.location && <span><span className="font-medium">Location:</span> {item.location}</span>}
                      </div>
                    )}
                    {item.type === 'profile' && (
                      <div className="text-sm text-gray-600 mb-2">
                        {item.businessName && <span><span className="font-medium">Business:</span> {item.businessName} • </span>}
                        <span className="font-medium">Approved:</span> {item.profileApproved ? 'Yes' : 'No'}
                      </div>
                    )}
                    
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-800">
                        <Flag className="w-4 h-4" />
                        <span className="font-medium">Flag Reason:</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">{item.flagReason}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item.id, 'approved', item.type, item.title)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'rejected', item.type, item.title)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item.id, item.type, item.title)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    
                    {(item.status === 'approved' || item.status === 'rejected') && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item.id, 'approved', item.type, item.title)}
                          disabled={item.status === 'approved'}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Re-approve
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item.id, item.type, item.title)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && contentItems.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No flagged content found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && contentItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalItems)} of {totalItems} items
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
                  Page {currentPage} of {Math.ceil(totalItems / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalItems / 20)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Actions Panel */}
        {stats.highSeverity > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High Priority Content Requires Immediate Attention
            </h3>
            <p className="text-red-700 mb-4">
              {stats.highSeverity} high-severity item{stats.highSeverity > 1 ? 's' : ''} flagged and waiting for review.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentItems.filter(item => item.severity === 'high' && item.status === 'pending').map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(item.type)}
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">By: {item.author}</p>
                  <p className="text-sm text-red-600 mb-3">{item.flagReason}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(item.id, 'approved', item.type, item.title)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'rejected', item.type, item.title)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
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