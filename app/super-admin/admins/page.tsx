"use client"

import { useState, useEffect } from "react"
import { Plus, Shield, Eye, Edit, Trash2, RefreshCw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { handleApiError } from "@/lib/api"

// Permission groups matching backend configuration
const PERMISSION_GROUPS = {
  users: {
    label: 'Users Management',
    description: 'Manage platform users (customers and contractors)',
    permissions: [
      { value: 'users:read', label: 'View Users' },
      { value: 'users:write', label: 'Edit Users' },
      { value: 'users:delete', label: 'Delete Users' },
    ],
  },
  jobs: {
    label: 'Jobs Management',
    description: 'View and manage jobs posted on the platform',
    permissions: [
      { value: 'jobs:read', label: 'View Jobs' },
      { value: 'jobs:write', label: 'Edit Jobs' },
      { value: 'jobs:delete', label: 'Delete Jobs' },
    ],
  },
  contractors: {
    label: 'Contractors Management',
    description: 'Manage contractor profiles and approvals',
    permissions: [
      { value: 'contractors:read', label: 'View Contractors' },
      { value: 'contractors:write', label: 'Edit Contractors' },
      { value: 'contractors:approve', label: 'Approve Contractors' },
    ],
  },
  kyc: {
    label: 'KYC Management',
    description: 'Review and approve KYC submissions',
    permissions: [
      { value: 'kyc:read', label: 'View KYC' },
      { value: 'kyc:write', label: 'Edit KYC' },
      { value: 'kyc:approve', label: 'Approve KYC' },
    ],
  },
  payments: {
    label: 'Payments & Invoices',
    description: 'Manage payments, invoices, and refunds',
    permissions: [
      { value: 'payments:read', label: 'View Payments' },
      { value: 'payments:write', label: 'Edit Payments' },
      { value: 'payments:refund', label: 'Process Refunds' },
    ],
  },
  reviews: {
    label: 'Reviews Management',
    description: 'Moderate and manage user reviews',
    permissions: [
      { value: 'reviews:read', label: 'View Reviews' },
      { value: 'reviews:write', label: 'Edit Reviews' },
      { value: 'reviews:delete', label: 'Delete Reviews' },
    ],
  },
  settings: {
    label: 'Settings Management',
    description: 'Configure platform settings',
    permissions: [
      { value: 'settings:read', label: 'View Settings' },
      { value: 'settings:write', label: 'Edit Settings' },
    ],
  },
  pricing: {
    label: 'Pricing Management',
    description: 'Manage service pricing and commission rates',
    permissions: [
      { value: 'pricing:read', label: 'View Pricing' },
      { value: 'pricing:write', label: 'Edit Pricing' },
    ],
  },
  support: {
    label: 'Support & Tickets',
    description: 'Handle customer support requests',
    permissions: [
      { value: 'support:read', label: 'View Support' },
      { value: 'support:write', label: 'Handle Support' },
    ],
  },
  content: {
    label: 'Content Management',
    description: 'Manage platform content (FAQ, featured contractors, etc.)',
    permissions: [
      { value: 'content:read', label: 'View Content' },
      { value: 'content:write', label: 'Edit Content' },
    ],
  },
  finalPrice: {
    label: 'Final Price Confirmations',
    description: 'Manage final price confirmations and overrides',
    permissions: [
      { value: 'final_price:read', label: 'View Final Price' },
      { value: 'final_price:write', label: 'Manage Final Price' },
    ],
  },
}

interface Admin {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN'
  permissions: string[] | null
  isActive: boolean
  twoFAEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'FINANCE_ADMIN' as 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN',
    password: '',
    confirmPassword: '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin-auth/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch admins')

      const data = await response.json()
      setAdmins(data.data.admins || [])
    } catch (error) {
      handleApiError(error, 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleGroupToggle = (groupPermissions: { value: string }[]) => {
    const permissionValues = groupPermissions.map(p => p.value)
    const allSelected = permissionValues.every(p => selectedPermissions.includes(p))

    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions(prev => prev.filter(p => !permissionValues.includes(p)))
    } else {
      // Select all in group
      setSelectedPermissions(prev => [
        ...prev.filter(p => !permissionValues.includes(p)),
        ...permissionValues
      ])
    }
  }

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.name || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    if (formData.role !== 'SUPER_ADMIN' && selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission for this admin",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/admin-auth/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          ...formData,
          permissions: formData.role === 'SUPER_ADMIN' ? null : selectedPermissions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create admin')
      }

      toast({
        title: "Success",
        description: "Admin created successfully",
      })

      setCreateDialogOpen(false)
      setFormData({
        email: '',
        name: '',
        role: 'FINANCE_ADMIN',
        password: '',
        confirmPassword: '',
      })
      setSelectedPermissions([])
      fetchAdmins()
    } catch (error) {
      handleApiError(error, 'Failed to create admin')
    } finally {
      setSubmitting(false)
    }
  }

  const getPermissionBadges = (permissions: string[] | null, role: string) => {
    if (role === 'SUPER_ADMIN') {
      return <Badge>All Permissions</Badge>
    }

    if (!permissions || permissions.length === 0) {
      return <Badge variant="outline">No Permissions</Badge>
    }

    return (
      <div className="flex flex-wrap gap-1">
        {permissions.slice(0, 3).map((perm) => (
          <Badge key={perm} variant="secondary" className="text-xs">
            {perm.split(':')[0]}
          </Badge>
        ))}
        {permissions.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{permissions.length - 3}
          </Badge>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admins...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Management</h1>
            </div>
            <p className="text-muted-foreground">
              Create and manage admin users with specific permissions
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin user and assign specific permissions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Admin name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@trustbuild.uk"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value as any })
                      if (e.target.value === 'SUPER_ADMIN') {
                        setSelectedPermissions([])
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="FINANCE_ADMIN">Finance Admin</option>
                    <option value="SUPPORT_ADMIN">Support Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.role === 'SUPER_ADMIN' 
                      ? 'Super Admin has all permissions by default'
                      : 'Select specific permissions below for this admin role'
                    }
                  </p>
                </div>

                {formData.role !== 'SUPER_ADMIN' && (
                  <div className="space-y-4">
                    <Label>Permissions *</Label>
                    <div className="border rounded-lg p-4 space-y-4 max-h-[300px] overflow-y-auto">
                      {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                        const groupPermissionValues = group.permissions.map(p => p.value)
                        const allGroupSelected = groupPermissionValues.every(p => 
                          selectedPermissions.includes(p)
                        )
                        const someGroupSelected = groupPermissionValues.some(p => 
                          selectedPermissions.includes(p)
                        )

                        return (
                          <div key={groupKey} className="space-y-2">
                            <div className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                              <Checkbox
                                id={`group-${groupKey}`}
                                checked={allGroupSelected}
                                onCheckedChange={() => handleGroupToggle(group.permissions)}
                                className={someGroupSelected && !allGroupSelected ? 'data-[state=checked]:bg-gray-400' : ''}
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={`group-${groupKey}`}
                                  className="font-semibold cursor-pointer"
                                >
                                  {group.label}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {group.description}
                                </p>
                              </div>
                            </div>
                            <div className="ml-6 space-y-2">
                              {group.permissions.map((permission) => (
                                <div key={permission.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.value}
                                    checked={selectedPermissions.includes(permission.value)}
                                    onCheckedChange={() => handlePermissionToggle(permission.value)}
                                  />
                                  <Label 
                                    htmlFor={permission.value}
                                    className="text-sm cursor-pointer"
                                  >
                                    {permission.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedPermissions.length} permission(s)
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Admin'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {admin.name}
                    {admin.role === 'SUPER_ADMIN' && (
                      <Badge variant="destructive">
                        <Shield className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                    {admin.role === 'FINANCE_ADMIN' && (
                      <Badge>Finance Admin</Badge>
                    )}
                    {admin.role === 'SUPPORT_ADMIN' && (
                      <Badge variant="secondary">Support Admin</Badge>
                    )}
                    {!admin.isActive && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{admin.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Permissions:</span>
                  {getPermissionBadges(admin.permissions, admin.role)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">2FA Status:</span>
                  <Badge variant={admin.twoFAEnabled ? "default" : "outline"}>
                    {admin.twoFAEnabled ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Disabled
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Login:</span>
                  <span className="text-sm">
                    {admin.lastLoginAt 
                      ? new Date(admin.lastLoginAt).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

