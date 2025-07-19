'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, UserPlus, Ban, CheckCircle, Eye, Edit, Trash2, Download, RefreshCw, X } from 'lucide-react'
import { adminApi, handleApiError, type User as ApiUser } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Extended User interface to match the backend data structure
interface User extends Omit<ApiUser, 'customer' | 'contractor'> {
  type: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'suspended' | 'pending' | 'banned'
  joinDate: string
  lastLogin: string
  totalJobs?: number
  totalSpent?: number
  totalEarned?: number
  verificationStatus?: 'verified' | 'pending' | 'rejected'
  customer?: {
    id: string
    phone?: string
    city?: string
    postcode?: string
    _count?: {
      jobs: number
      reviews: number
    }
  }
  contractor?: {
    id: string
    businessName?: string
    profileApproved: boolean
    status: string
    averageRating?: number
    reviewCount?: number
    jobsCompleted?: number
    _count?: {
      applications: number
      reviews: number
    }
  }
}

// Add User Modal Component
interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: (user: User) => void
}

function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Creating new admin user:', { ...formData, password: '[HIDDEN]' })
      
      const newUser = await adminApi.createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      
      console.log('✅ Admin user created successfully:', newUser)
      
      // Transform the user to match our interface
      const transformedUser: User = {
        ...newUser,
        type: newUser.role as 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN',
        status: newUser.isActive ? 'active' : 'suspended',
        joinDate: newUser.createdAt,
        lastLogin: newUser.createdAt,
      }
      
      onUserAdded(transformedUser)
      
      toast({
        title: "User Created",
        description: `Admin user ${formData.name} has been created successfully`,
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('❌ Error creating admin user:', error)
      handleApiError(error, 'Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Admin User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password (min 8 characters)"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Note: Only admin users can be created through this interface
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SuperAdminUserManagement() {
  const { user: currentUser, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

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

  // Memoized fetch function to prevent recreation on every render
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || currentUser?.role !== 'SUPER_ADMIN') {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching users with params:', {
        page: currentPage,
        limit: 20,
        role: filterType !== 'all' ? filterType.toUpperCase() : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
        currentUser: currentUser?.role,
        token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
      })

      const response = await adminApi.getAllUsers({
        page: currentPage,
        limit: 20,
        role: filterType !== 'all' ? filterType.toUpperCase() : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      })
      
      console.log('✅ API Response received:', response)
      
      // Transform the API response to match our interface
      const transformedUsers: User[] = response.data.map((user: any) => ({
        ...user,
        type: user.role as 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN',
        status: user.isActive ? 'active' : 'suspended',
        joinDate: user.createdAt,
        lastLogin: user.createdAt, // Using createdAt as lastLogin for now
        totalJobs: user.customer?._count?.jobs || user.contractor?.jobsCompleted || 0,
        totalSpent: user.customer?._count?.jobs ? user.customer._count.jobs * 1000 : undefined,
        totalEarned: user.contractor?.jobsCompleted ? user.contractor.jobsCompleted * 1200 : undefined,
        verificationStatus: user.contractor?.profileApproved ? 'verified' : 
                           user.contractor?.profileApproved === false ? 'pending' : undefined,
      }))
      
      console.log('🔄 Transformed users:', transformedUsers)
      setUsers(transformedUsers)
      setTotalUsers(response.data.pagination.total)
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${transformedUsers.length} users`,
      })
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users'
      setError(errorMessage)
      handleApiError(error, 'Failed to fetch users')
      
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
  }, [currentPage, filterType, filterStatus, searchTerm, isAuthenticated, currentUser])

  // Handle user status changes
  const handleStatusChange = async (id: string, newStatus: User['status'], userName: string) => {
    try {
      console.log(`🔄 Changing status for user ${userName} (${id}) to ${newStatus}`)
      const action = newStatus === 'active' ? 'activate' : 'deactivate'
      await adminApi.manageUser(id, action)
      
      toast({
        title: "User Updated",
        description: `User ${userName} has been ${action}d successfully`,
      })
      
      // Update local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, status: newStatus } : user
      ))
    } catch (error) {
      console.error('❌ Error updating user status:', error)
      handleApiError(error, `Failed to update user status`)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      console.log(`🗑️ Deleting user ${userName} (${id})`)
      await adminApi.manageUser(id, 'delete')
      
      toast({
        title: "User Deleted",
        description: `User ${userName} has been deleted successfully`,
      })
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== id))
      setTotalUsers(prev => prev - 1)
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      handleApiError(error, 'Failed to delete user')
    }
  }

  // Handle adding new user
  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [newUser, ...prev])
    setTotalUsers(prev => prev + 1)
  }

  // Handle export users
  const handleExportUsers = async () => {
    try {
      setExportLoading(true)
      console.log('📊 Exporting users to CSV...')
      
      // Fetch all users (without pagination) for export
      const response = await adminApi.getAllUsers({
        limit: 10000, // Get all users
        role: filterType !== 'all' ? filterType.toUpperCase() : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
      })
      
      const allUsers = response.data.map((user: any) => ({
        ...user,
        type: user.role as 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN',
        status: user.isActive ? 'active' : 'suspended',
        joinDate: user.createdAt,
        lastLogin: user.createdAt,
        totalJobs: user.customer?._count?.jobs || user.contractor?.jobsCompleted || 0,
        totalSpent: user.customer?._count?.jobs ? user.customer._count.jobs * 1000 : undefined,
        totalEarned: user.contractor?.jobsCompleted ? user.contractor.jobsCompleted * 1200 : undefined,
        verificationStatus: user.contractor?.profileApproved ? 'verified' : 
                           user.contractor?.profileApproved === false ? 'pending' : undefined,
      }))
      
      // Create CSV content
      const headers = [
        'ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Last Login',
        'Total Jobs', 'Total Spent', 'Total Earned', 'Verification Status',
        'Business Name', 'Phone', 'City', 'Average Rating'
      ]
      
      const csvContent = [
        headers.join(','),
        ...allUsers.map((user: User) => [
          user.id,
          `"${user.name}"`,
          user.email,
          user.type,
          user.status,
          new Date(user.joinDate).toLocaleDateString(),
          new Date(user.lastLogin).toLocaleDateString(),
          user.totalJobs || 0,
          user.totalSpent || '',
          user.totalEarned || '',
          user.verificationStatus || '',
          user.contractor?.businessName ? `"${user.contractor.businessName}"` : '',
          user.customer?.phone || user.contractor?.businessName || '',
          user.customer?.city || '',
          user.contractor?.averageRating || ''
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `trustbuild-users-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${allUsers.length} users to CSV`,
      })
      
      console.log('✅ Users exported successfully')
    } catch (error) {
      console.error('❌ Error exporting users:', error)
      handleApiError(error, 'Failed to export users')
    } finally {
      setExportLoading(false)
    }
  }

  // Initial load and when dependencies change
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'SUPER_ADMIN') {
      fetchUsers()
    }
  }, [fetchUsers])

  // Calculate stats from real data
  const stats = {
    totalUsers: totalUsers,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    totalCustomers: users.filter(u => u.type === 'CUSTOMER').length,
    totalContractors: users.filter(u => u.type === 'CONTRACTOR').length,
    totalAdmins: users.filter(u => u.type === 'ADMIN' || u.type === 'SUPER_ADMIN').length
  }

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      banned: 'bg-gray-100 text-gray-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`
  }

  const getTypeBadge = (type: User['type']) => {
    const styles = {
      CUSTOMER: 'bg-blue-100 text-blue-800',
      CONTRACTOR: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-indigo-100 text-indigo-800',
      SUPER_ADMIN: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
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
            <strong>🐛 Debug Info:</strong> Users: {users.length}, Total: {totalUsers}, Loading: {loading ? 'true' : 'false'}, 
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all platform users, contractors, and administrators</p>
            </div>
            <button 
              onClick={fetchUsers}
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
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs text-blue-600">{stats.totalCustomers} customers</span>
              <span className="text-xs text-purple-600">{stats.totalContractors} contractors</span>
              <span className="text-xs text-indigo-600">{stats.totalAdmins} admins</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% of total
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting verification</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Require attention</p>
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
                  placeholder="Search users..."
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
                <option value="customer">Customers</option>
                <option value="contractor">Contractors</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleExportUsers}
                disabled={exportLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${exportLoading ? 'animate-spin' : ''}`} />
                {exportLoading ? 'Exporting...' : 'Export Users'}
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span className={getTypeBadge(user.type)}>
                            {user.type.charAt(0) + user.type.slice(1).toLowerCase()}
                        </span>
                        <span className={getStatusBadge(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        {user.verificationStatus && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.verificationStatus === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : user.verificationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.verificationStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Joined: {new Date(user.joinDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">Last login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {user.totalJobs !== undefined && (
                          <div>Jobs: {user.totalJobs}</div>
                        )}
                        {user.totalSpent && (
                          <div className="text-green-600">Spent: ${user.totalSpent.toLocaleString()}</div>
                        )}
                        {user.totalEarned && (
                          <div className="text-blue-600">Earned: ${user.totalEarned.toLocaleString()}</div>
                        )}
                          {user.contractor?.averageRating && (
                            <div className="text-yellow-600">Rating: {user.contractor.averageRating.toFixed(1)}/5</div>
                        )}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                              onClick={() => handleStatusChange(user.id, 'suspended', user.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          ) : (
                          <button
                              onClick={() => handleStatusChange(user.id, 'active', user.name)}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        {!loading && users.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
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
                  Page {currentPage} of {Math.ceil(totalUsers / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalUsers / 20)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
        />
      </div>
    </div>
  )
} 