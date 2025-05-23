'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Flag, AlertTriangle, Eye, CheckCircle, X, MessageSquare, Image, FileText } from 'lucide-react'

interface ContentItem {
  id: string
  type: 'review' | 'job_description' | 'profile' | 'message' | 'image'
  title: string
  content: string
  author: string
  flaggedBy: string
  flagReason: string
  status: 'pending' | 'approved' | 'rejected'
  severity: 'low' | 'medium' | 'high'
  createdDate: string
  flaggedDate: string
}

export default function SuperAdminContentModeration() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      type: 'review',
      title: 'Review for Electric Pro',
      content: 'Terrible work, completely unprofessional. Would not recommend to anyone. Wasted my money and time.',
      author: 'Lisa Johnson',
      flaggedBy: 'Electric Pro',
      flagReason: 'Unfair negative review',
      status: 'pending',
      severity: 'medium',
      createdDate: '2024-03-10',
      flaggedDate: '2024-03-12'
    },
    {
      id: '2',
      type: 'job_description',
      title: 'Urgent Plumbing Repair',
      content: 'Need immediate help! Cash payment only, no questions asked. Must be done tonight.',
      author: 'Anonymous User',
      flaggedBy: 'System Auto-detection',
      flagReason: 'Suspicious payment terms',
      status: 'pending',
      severity: 'high',
      createdDate: '2024-03-13',
      flaggedDate: '2024-03-13'
    },
    {
      id: '3',
      type: 'profile',
      title: 'Contractor Profile: Quick Fix Solutions',
      content: 'Best contractor in town! We guarantee results or your money back. Licensed and insured.',
      author: 'Quick Fix Solutions',
      flaggedBy: 'Competitor Report',
      flagReason: 'False licensing claims',
      status: 'pending',
      severity: 'high',
      createdDate: '2024-03-08',
      flaggedDate: '2024-03-11'
    },
    {
      id: '4',
      type: 'message',
      title: 'Message to contractor',
      content: 'Can we meet in person to discuss payment terms? I have a better offer.',
      author: 'Mike Davis',
      flaggedBy: 'Bob Construction',
      flagReason: 'Attempting to bypass platform',
      status: 'approved',
      severity: 'low',
      createdDate: '2024-03-05',
      flaggedDate: '2024-03-07'
    },
    {
      id: '5',
      type: 'review',
      title: 'Review for Mike Johnson',
      content: 'Amazing work! Highly professional and completed on time. Would definitely hire again.',
      author: 'Sarah Wilson',
      flaggedBy: 'System Auto-detection',
      flagReason: 'Potentially fake positive review',
      status: 'rejected',
      severity: 'low',
      createdDate: '2024-03-01',
      flaggedDate: '2024-03-02'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const stats = {
    totalFlagged: contentItems.length,
    pendingReview: contentItems.filter(item => item.status === 'pending').length,
    approved: contentItems.filter(item => item.status === 'approved').length,
    rejected: contentItems.filter(item => item.status === 'rejected').length,
    highSeverity: contentItems.filter(item => item.severity === 'high').length,
    mediumSeverity: contentItems.filter(item => item.severity === 'medium').length,
    lowSeverity: contentItems.filter(item => item.severity === 'low').length
  }

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity
    return matchesSearch && matchesType && matchesStatus && matchesSeverity
  })

  const handleStatusChange = (id: string, newStatus: ContentItem['status']) => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
  }

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
        return <Eye className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/super-admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Super Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-2">Review flagged content and manage platform safety</p>
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
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-500 mt-1">Content cleared</p>
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
          </div>
        </div>

        {/* Content Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
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
                    <p className="text-gray-700 text-sm">{item.content}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                  
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
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
                        onClick={() => handleStatusChange(item.id, 'approved')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(item.id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {(item.status === 'approved' || item.status === 'rejected') && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'pending')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Re-review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No flagged content found matching your criteria.</p>
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
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'rejected')}
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