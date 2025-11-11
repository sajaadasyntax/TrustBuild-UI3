"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  UserPlus, Search, Filter, Eye, Shield, UserCheck, UserX, Trash2, 
  RefreshCw, Users, Crown, Download
} from "lucide-react"
import { adminApi } from '@/lib/adminApi'
import { toast } from '@/hooks/use-toast'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

// Type definitions
interface User {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  createdAt: string
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error)
  toast({
    title: "Error",
    description: error.message || defaultMessage,
    variant: "destructive",
  })
}

export default function AdminUsersPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users')
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  })
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SUPPORT_ADMIN' as 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN',
    permissions: [] as string[]
  })
  const [creatingAdmin, setCreatingAdmin] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminApi.getAllUsers({
        page: currentPage,
        limit: 10,
        ...filters
      })
      setUsers((response.data as any).users || [])
      setTotalUsers((response.data as any).pagination.total)
    } catch (error) {
      handleApiError(error, 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  const fetchAdmins = useCallback(async () => {
    // Only super admins can view admin list
    if (admin?.role !== 'SUPER_ADMIN') {
      setLoadingAdmins(false)
      return
    }
    
    try {
      setLoadingAdmins(true)
      const adminsList = await adminApi.listAdmins()
      setAdmins(adminsList || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch admins')
    } finally {
      setLoadingAdmins(false)
    }
  }, [admin])

  useEffect(() => {
    // Wait for authentication to be ready before fetching data
    if (!authLoading) {
      fetchUsers()
      if (admin?.role === 'SUPER_ADMIN') {
        fetchAdmins()
      }
    }
  }, [fetchUsers, fetchAdmins, authLoading, admin])

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingAdmin(true)
      
      // Prepare admin data with permissions for non-SUPER_ADMIN roles
      const adminData: any = {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role
      }
      
      // Add default permissions for non-SUPER_ADMIN roles
      if (newAdmin.role !== 'SUPER_ADMIN') {
        const defaultPermissions = newAdmin.role === 'FINANCE_ADMIN' 
          ? [
              // Finance Admin permissions
              'payments:read',
              'payments:write',
              'payments:refund',
              'jobs:read',
              'contractors:read',
              'users:read',
              'pricing:read',
              'pricing:write',
            ]
          : [
              // Support Admin permissions
              'users:read',
              'jobs:read',
              'jobs:write',
              'contractors:read',
              'reviews:read',
              'reviews:write',
              'content:read',
              'content:write',
              'support:read',
              'support:write',
              'payments:read',
            ]
        adminData.permissions = defaultPermissions
      }
      
      await adminApi.createAdmin(adminData)
      
      toast({
        title: "Admin Created",
        description: `New admin ${newAdmin.name} has been created successfully`,
      })
      
      // Refresh admin list
      fetchAdmins()
      
      setShowCreateAdmin(false)
      setNewAdmin({ 
        name: '', 
        email: '', 
        password: '',
        role: 'SUPPORT_ADMIN',
        permissions: []
      })
      fetchUsers()
    } catch (error) {
      handleApiError(error, 'Failed to create admin')
    } finally {
      setCreatingAdmin(false)
    }
  }

  const exportToCSV = (data: any[], filename: string, type: 'users' | 'admins') => {
    if (type === 'users') {
      const csvContent = [
        ['Name', 'Email', 'Role', 'Status', 'Created Date'].join(','),
        ...data.map(user => [
          user.name,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          new Date(user.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    } else {
      const csvContent = [
        ['Name', 'Email', 'Role', 'Status', '2FA', 'Last Login', 'Created Date'].join(','),
        ...data.map(admin => [
          admin.name,
          admin.email,
          admin.role.replace('_', ' '),
          admin.isActive ? 'Active' : 'Inactive',
          admin.twoFAEnabled ? 'Enabled' : 'Disabled',
          admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never',
          new Date(admin.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete', userName: string) => {
    try {
      await adminApi.manageUser(userId, action)
      
      toast({
        title: "User Updated",
        description: `User ${userName} has been ${action}d successfully`,
      })
      
      fetchUsers()
    } catch (error) {
      handleApiError(error, `Failed to ${action} user`)
    }
  }

  const handleAdminStatusToggle = async (adminId: string, newStatus: boolean, adminName: string) => {
    // Prevent disabling Main Super Admin
    const targetAdmin = admins.find(a => a.id === adminId)
    if (targetAdmin?.isMainSuperAdmin && newStatus === false) {
      toast({
        title: "Action Not Allowed",
        description: "The Main Super Admin cannot be disabled",
        variant: "destructive",
      })
      return
    }

    try {
      await adminApi.updateAdmin(adminId, { isActive: newStatus })
      
      toast({
        title: "Admin Updated",
        description: `Admin ${adminName} has been ${newStatus ? 'enabled' : 'disabled'} successfully`,
      })
      
      fetchAdmins()
    } catch (error) {
      handleApiError(error, `Failed to ${newStatus ? 'enable' : 'disable'} admin`)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'CONTRACTOR':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage all users, create admins, and control user access
            </p>
          </div>
          
          {admin?.role === 'SUPER_ADMIN' && (
            <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Create Admin
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Create a new administrator account with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter admin name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter admin email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Admin Role</Label>
                  <Select
                    value={newAdmin.role}
                    onValueChange={(value: any) => setNewAdmin(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admin role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Super Admin (Full Access)</SelectItem>
                      <SelectItem value="FINANCE_ADMIN">Finance Admin (Payments & Subscriptions)</SelectItem>
                      <SelectItem value="SUPPORT_ADMIN">Support Admin (User Support & Reviews)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {newAdmin.role === 'SUPER_ADMIN' && 'Full system access with all permissions'}
                    {newAdmin.role === 'FINANCE_ADMIN' && 'Can manage payments, subscriptions, and financial reports'}
                    {newAdmin.role === 'SUPPORT_ADMIN' && 'Can manage user support, reviews, and user accounts'}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter secure password (min 8 characters)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
                  {creatingAdmin ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Create Admin
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs for Users and Admins */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">Platform Users</TabsTrigger>
            {admin?.role === 'SUPER_ADMIN' && (
              <TabsTrigger value="admins">Administrators</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-6">
            {/* User Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="role-filter">Role</Label>
                    <Select
                      value={filters.role}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Users ({totalUsers})</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToCSV(users, `users-${new Date().toISOString().split('T')[0]}.csv`, 'users')}
                  disabled={users.length === 0}
                >
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Export CSV</span>
                </Button>
                <Button variant="outline" size="sm" onClick={fetchUsers}>
                  <RefreshCw className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Refresh</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === 'ADMIN' && <Crown className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.isActive)}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'deactivate', user.name)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'activate', user.name)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {user.role !== 'ADMIN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'delete', user.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

            {/* Pagination */}
            {totalUsers > 10 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {Math.ceil(totalUsers / 10)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalUsers / 10)}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Admins Tab - Only visible to SUPER_ADMIN */}
          {admin?.role === 'SUPER_ADMIN' && (
            <TabsContent value="admins" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Administrators ({admins.length})
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => exportToCSV(admins, `admins-${new Date().toISOString().split('T')[0]}.csv`, 'admins')}
                        disabled={admins.length === 0}
                      >
                        <Download className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Export CSV</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={fetchAdmins}>
                        <RefreshCw className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Refresh</span>
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Manage administrator accounts and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAdmins ? (
                    <div className="flex justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : admins.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No administrators found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admin</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>2FA</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((adminUser) => (
                          <TableRow key={adminUser.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {adminUser.role === 'SUPER_ADMIN' && <Crown className="w-4 h-4 text-yellow-500" />}
                                  {adminUser.name}
                                </div>
                                <div className="text-sm text-muted-foreground">{adminUser.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                adminUser.role === 'SUPER_ADMIN' ? 'default' :
                                adminUser.role === 'FINANCE_ADMIN' ? 'secondary' :
                                'outline'
                              }>
                                {adminUser.role.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(adminUser.isActive)}>
                                {adminUser.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {adminUser.twoFAEnabled ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Disabled
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {adminUser.lastLoginAt 
                                ? new Date(adminUser.lastLoginAt).toLocaleString()
                                : 'Never'
                              }
                            </TableCell>
                            <TableCell>
                              {new Date(adminUser.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {adminUser.id !== admin.id && !adminUser.isMainSuperAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAdminStatusToggle(adminUser.id, !adminUser.isActive, adminUser.name)}
                                >
                                  {adminUser.isActive ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-1" />
                                      Disable
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      Enable
                                    </>
                                  )}
                                </Button>
                              )}
                              {adminUser.isMainSuperAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  Protected
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
} 