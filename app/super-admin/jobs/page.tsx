'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, FileText, AlertTriangle, DollarSign, Clock, CheckCircle, X, Eye, Flag } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  customer: string
  contractor?: string
  category: string
  status: 'posted' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  budget: number
  postedDate: string
  completionDate?: string
  location: string
  flagged: boolean
  disputeReason?: string
}

export default function SuperAdminJobManagement() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Kitchen Renovation',
      description: 'Complete kitchen remodel including cabinets, countertops, and appliances',
      customer: 'John Smith',
      contractor: 'Mike Johnson',
      category: 'Home Renovation',
      status: 'in_progress',
      budget: 15000,
      postedDate: '2024-03-01',
      location: 'Austin, TX',
      flagged: false
    },
    {
      id: '2',
      title: 'Roof Repair',
      description: 'Fix leaking roof and replace damaged shingles',
      customer: 'Sarah Wilson',
      contractor: 'Bob Construction',
      category: 'Roofing',
      status: 'completed',
      budget: 3500,
      postedDate: '2024-02-20',
      completionDate: '2024-03-10',
      location: 'Dallas, TX',
      flagged: false
    },
    {
      id: '3',
      title: 'Plumbing Installation',
      description: 'Install new plumbing system for bathroom renovation',
      customer: 'Mike Davis',
      category: 'Plumbing',
      status: 'posted',
      budget: 2800,
      postedDate: '2024-03-15',
      location: 'Houston, TX',
      flagged: false
    },
    {
      id: '4',
      title: 'Electrical Work',
      description: 'Rewire old electrical system and install new panels',
      customer: 'Lisa Johnson',
      contractor: 'Electric Pro',
      category: 'Electrical',
      status: 'disputed',
      budget: 4200,
      postedDate: '2024-02-15',
      location: 'San Antonio, TX',
      flagged: true,
      disputeReason: 'Work quality issues reported'
    },
    {
      id: '5',
      title: 'Garden Landscaping',
      description: 'Design and implement new garden landscape with irrigation',
      customer: 'Tom Brown',
      category: 'Landscaping',
      status: 'cancelled',
      budget: 5500,
      postedDate: '2024-03-08',
      location: 'Fort Worth, TX',
      flagged: false
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false)

  const stats = {
    totalJobs: jobs.length,
    postedJobs: jobs.filter(j => j.status === 'posted').length,
    inProgressJobs: jobs.filter(j => j.status === 'in_progress').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    disputedJobs: jobs.filter(j => j.status === 'disputed').length,
    flaggedJobs: jobs.filter(j => j.flagged).length,
    totalValue: jobs.reduce((sum, job) => sum + job.budget, 0)
  }

  const categories = ['all', 'Home Renovation', 'Roofing', 'Plumbing', 'Electrical', 'Landscaping', 'Painting', 'HVAC']

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory
    const matchesFlagged = !showFlaggedOnly || job.flagged
    return matchesSearch && matchesStatus && matchesCategory && matchesFlagged
  })

  const handleStatusChange = (id: string, newStatus: Job['status']) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    ))
  }

  const handleToggleFlag = (id: string) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, flagged: !job.flagged } : job
    ))
  }

  const getStatusBadge = (status: Job['status']) => {
    const styles = {
      posted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`
  }

  const formatStatus = (status: Job['status']) => {
    return status.split('_').map(word => 
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
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all platform jobs and disputes</p>
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
            <h3 className="text-sm font-medium text-gray-500">Disputed Jobs</h3>
            <p className="text-2xl font-bold text-red-600">{stats.disputedJobs}</p>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
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
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Flagged</h3>
            <p className="text-2xl font-bold text-red-600">{stats.flaggedJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {((stats.completedJobs / (stats.totalJobs - stats.postedJobs)) * 100).toFixed(1)}%
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
                <option value="posted">Posted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
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
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                                    {job.flagged && (                            <Flag className="w-4 h-4 text-red-500" />                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{job.description.substring(0, 60)}...</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {job.category} • {job.location}
                        </div>
                        {job.disputeReason && (
                          <div className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                            Dispute: {job.disputeReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">Customer: {job.customer}</div>
                        <div className="text-gray-500">
                          Contractor: {job.contractor || 'Not assigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={getStatusBadge(job.status)}>
                          {formatStatus(job.status)}
                        </span>
                        <div className="text-sm font-medium text-gray-900 mt-2">
                          ${job.budget.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Posted: {new Date(job.postedDate).toLocaleDateString()}</div>
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
                          onClick={() => handleToggleFlag(job.id)}
                          className={`${job.flagged ? 'text-red-600 hover:text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                          title={job.flagged ? 'Remove flag' : 'Flag job'}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        {job.status === 'disputed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(job.id, 'in_progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Resolve dispute"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(job.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel job"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {job.status === 'posted' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel job"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(job.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        )}

        {/* Dispute Resolution Panel */}
        {stats.disputedJobs > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dispute Resolution Required
            </h3>
            <p className="text-red-700 mb-4">
              {stats.disputedJobs} job{stats.disputedJobs > 1 ? 's' : ''} currently in dispute requiring admin attention.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.filter(job => job.status === 'disputed').map(job => (
                <div key={job.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">Customer: {job.customer}</p>
                  <p className="text-sm text-gray-600">Contractor: {job.contractor}</p>
                  <p className="text-sm text-red-600 mt-2">{job.disputeReason}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStatusChange(job.id, 'in_progress')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusChange(job.id, 'cancelled')}
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