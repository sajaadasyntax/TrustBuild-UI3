'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, UserPlus, Ban, CheckCircle, Eye, Edit, Trash2, Download } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  type: 'customer' | 'contractor' | 'admin'
  status: 'active' | 'suspended' | 'pending' | 'banned'
  joinDate: string
  lastLogin: string
  totalJobs?: number
  totalSpent?: number
  totalEarned?: number
  verificationStatus?: 'verified' | 'pending' | 'rejected'
}

export default function SuperAdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      type: 'customer',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-03-15',
      totalJobs: 5,
      totalSpent: 2500
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike@contractor.com',
      type: 'contractor',
      status: 'active',
      joinDate: '2024-02-01',
      lastLogin: '2024-03-14',
      totalJobs: 12,
      totalEarned: 15600,
      verificationStatus: 'verified'
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      email: 'sarah@admin.com',
      type: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-03-15'
    },
    {
      id: '4',
      name: 'Bob Brown',
      email: 'bob@example.com',
      type: 'contractor',
      status: 'suspended',
      joinDate: '2024-01-20',
      lastLogin: '2024-03-10',
      totalJobs: 3,
      totalEarned: 1200,
      verificationStatus: 'pending'
    },
    {
      id: '5',
      name: 'Lisa Davis',
      email: 'lisa@example.com',
      type: 'customer',
      status: 'pending',
      joinDate: '2024-03-14',
      lastLogin: '2024-03-14',
      totalJobs: 0,
      totalSpent: 0
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    totalCustomers: users.filter(u => u.type === 'customer').length,
    totalContractors: users.filter(u => u.type === 'contractor').length,
    totalAdmins: users.filter(u => u.type === 'admin').length
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || user.type === filterType
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleStatusChange = (id: string, newStatus: User['status']) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    ))
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
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
      customer: 'bg-blue-100 text-blue-800',
      contractor: 'bg-purple-100 text-purple-800',
      admin: 'bg-indigo-100 text-indigo-800'
    }
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all platform users, contractors, and administrators</p>
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
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
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
            <div className="flex gap-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Users
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                {filteredUsers.map((user) => (
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
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
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
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : user.status === 'pending' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 