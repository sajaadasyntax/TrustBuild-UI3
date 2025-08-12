"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CheckCircle, 
  Clock, 
  Search, 
  Star, 
  User, 
  XCircle,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Filter,
  RefreshCw,
  Building,
  Mail,
  Phone,
  MapPin,
  Download,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  Activity,
  CreditCard,
  Plus,
  Minus,
  History
} from 'lucide-react'
import { contractorsApi, adminApi, handleApiError, Contractor } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContractorStats {
  totalContractors: number;
  activeContractors: number;
  suspendedContractors: number;
  pendingApproval: number;
  verifiedContractors: number;
  premiumContractors: number;
  standardContractors: number;
  completionRate: number;
  approvalRate: number;
  recentContractors: any[];
  topRatedContractors: any[];
}

export default function AdminContractors() {
  const { user, isAuthenticated } = useAuth()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [pendingContractors, setPendingContractors] = useState<Contractor[]>([])
  const [stats, setStats] = useState<ContractorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [approvalData, setApprovalData] = useState({
    approved: true,
    reason: '',
    notes: ''
  })
  const [statusData, setStatusData] = useState({
    status: '',
    reason: ''
  })
  const [creditData, setCreditData] = useState({
    type: 'ADDITION' as 'ADDITION' | 'DEDUCTION',
    amount: 1,
    reason: ''
  })
  const [processing, setProcessing] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting...')
      return
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      })
      return
    }

    console.log('Admin authenticated, loading data...')
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      fetchContractors()
      fetchPendingContractors()
      fetchStats()
    }
  }, [page, searchTerm, statusFilter, tierFilter, approvalFilter, isAuthenticated, user])

  const fetchContractors = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 20,
      }

      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.status = statusFilter
      if (approvalFilter !== 'all') params.approved = approvalFilter

      console.log('Fetching contractors with params:', params)
      const response = await adminApi.getAllContractors(params)
      console.log('Contractors response:', response)
      
      setContractors(response.data.contractors || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching contractors:', error)
      handleApiError(error, 'Failed to fetch contractors')
      setContractors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingContractors = async () => {
    try {
      const response = await adminApi.getPendingContractors({ limit: 10 })
      console.log('Pending contractors response:', response)
      setPendingContractors(response.data.contractors || [])
    } catch (error) {
      console.error('Error fetching pending contractors:', error)
      handleApiError(error, 'Failed to fetch pending contractors')
      setPendingContractors([])
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await adminApi.getContractorStats()
      console.log('Contractor stats response:', response)
      setStats(response)
    } catch (error) {
      console.error('Error fetching contractor stats:', error)
      handleApiError(error, 'Failed to fetch contractor statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const handleApproval = async (contractorId: string, approved: boolean, reason?: string) => {
    try {
      await adminApi.approveContractor(contractorId, approved, reason)
      toast({
        title: 'Success',
        description: `Contractor ${approved ? 'approved' : 'rejected'} successfully`,
      })
      fetchContractors()
      fetchPendingContractors()
      fetchStats()
    } catch (error) {
      handleApiError(error, `Failed to ${approved ? 'approve' : 'reject'} contractor`)
    }
  }

  const handleStatusChange = async (contractorId: string, status: string, reason?: string) => {
    try {
      setProcessing(true)
      await adminApi.updateContractorStatus(contractorId, status, reason)
      toast({
        title: 'Status Updated',
        description: `Contractor status changed to ${status.toLowerCase()} successfully`,
      })
      fetchContractors()
      fetchStats()
      setShowStatusDialog(false)
      setSelectedContractor(null)
    } catch (error) {
      handleApiError(error, 'Failed to update contractor status')
    } finally {
      setProcessing(false)
    }
  }

  const handleCreditAdjustment = async () => {
    if (!selectedContractor) return

    try {
      setProcessing(true)
      // Handle credit amount based on type (positive for addition, negative for deduction)
      const adjustmentAmount = creditData.type === 'DEDUCTION' ? -creditData.amount : creditData.amount
      await adminApi.adjustContractorCredits(
        selectedContractor.id,
        adjustmentAmount,
        creditData.reason
      )
      
      const action = creditData.type === 'ADDITION' ? 'added' : 'removed'
      toast({
        title: 'Credits Updated',
        description: `Successfully ${action} ${creditData.amount} credit${creditData.amount !== 1 ? 's' : ''} ${creditData.type === 'ADDITION' ? 'to' : 'from'} ${selectedContractor.user.name}`,
      })
      
      fetchContractors()
      fetchStats()
      setShowCreditDialog(false)
      setSelectedContractor(null)
      setCreditData({ type: 'ADDITION', amount: 1, reason: '' })
    } catch (error) {
      handleApiError(error, 'Failed to adjust credits')
    } finally {
      setProcessing(false)
    }
  }

  const openCreditDialog = (contractor: Contractor) => {
    setSelectedContractor(contractor)
    setCreditData({ type: 'ADDITION', amount: 1, reason: '' })
    setShowCreditDialog(true)
  }

  const exportContractors = async () => {
    try {
      setExporting(true)
      
      // Get all contractors for export (no pagination)
      const params: any = { limit: 10000 }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.status = statusFilter
      if (tierFilter !== 'all') params.tier = tierFilter
      if (approvalFilter !== 'all') params.approved = approvalFilter

      const response = await adminApi.getAllContractors(params)
      const contractorsData = response.data.contractors || []

      // Create CSV content
      const headers = [
        'ID', 'Name', 'Business Name', 'Email', 'Phone', 'City', 'Postcode',
        'Status', 'Tier', 'Profile Approved', 'Jobs Completed', 'Average Rating',
        'Review Count', 'Years Experience', 'Services Provided', 'Created At'
      ]

      const csvContent = [
        headers.join(','),
        ...contractorsData.map((contractor: any) => [
          contractor.id,
          `"${contractor.user?.name || ''}"`,
          `"${contractor.businessName || ''}"`,
          contractor.user?.email || '',
          contractor.phone || '',
          contractor.city || '',
          contractor.postcode || '',
          contractor.status || '',
          contractor.tier || '',
          contractor.profileApproved ? 'Yes' : 'No',
          contractor.jobsCompleted || 0,
          contractor.averageRating || 0,
          contractor.reviewCount || 0,
          `"${contractor.yearsExperience || ''}"`,
          `"${contractor.servicesProvided || ''}"`,
          new Date(contractor.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `contractors-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Exported ${contractorsData.length} contractors to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      handleApiError(error, 'Failed to export contractors')
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (contractor: Contractor) => {
    if (!contractor.profileApproved) {
      return <Badge variant="secondary">Pending</Badge>
    }
    
    switch (contractor.status?.toLowerCase()) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case 'rejected':
        return <Badge className="bg-gray-100 text-gray-800">Rejected</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case 'enterprise':
        return <Badge className="bg-blue-100 text-blue-800">Enterprise</Badge>
      default:
        return <Badge variant="outline">Standard</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const openApprovalDialog = (contractor: Contractor, approved: boolean) => {
    setSelectedContractor(contractor)
    setApprovalData({ approved, reason: '', notes: '' })
    setShowApprovalDialog(true)
  }

  const openStatusDialog = (contractor: Contractor, status: string) => {
    setSelectedContractor(contractor)
    setStatusData({ status, reason: '' })
    setShowStatusDialog(true)
  }

  const handleApprovalSubmit = async () => {
    if (!selectedContractor) return

    try {
      setProcessing(true)
      await adminApi.approveContractor(
        selectedContractor.id,
        approvalData.approved,
        approvalData.reason,
        approvalData.notes
      )
      
      toast({
        title: approvalData.approved ? "Contractor Approved" : "Contractor Rejected",
        description: `${selectedContractor.businessName || selectedContractor.user.name} has been ${approvalData.approved ? 'approved' : 'rejected'}`,
      })
      
      setShowApprovalDialog(false)
      setSelectedContractor(null)
      setApprovalData({ approved: true, reason: '', notes: '' })
      fetchContractors()
      fetchPendingContractors()
      fetchStats()
    } catch (error) {
      handleApiError(error, 'Failed to update contractor approval')
    } finally {
      setProcessing(false)
    }
  }

  const handleStatusSubmit = async () => {
    if (!selectedContractor || !statusData.status) return

    try {
      setProcessing(true)
      await handleStatusChange(selectedContractor.id, statusData.status, statusData.reason)
    } finally {
      setProcessing(false)
    }
  }

  // Show loading state if not authenticated or user data not loaded
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && contractors.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contractor Management</h1>
        <p className="text-muted-foreground">
          Manage contractor profiles, approvals, and verification status
        </p>
        <div className="text-xs text-muted-foreground mt-1">
          Debug: User role: {user?.role}, Authenticated: {isAuthenticated ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContractors}</div>
              <p className="text-xs text-muted-foreground">
                {typeof stats.approvalRate === 'number' ? stats.approvalRate.toFixed(1) : stats.approvalRate || '0.0'}% approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contractors</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeContractors}</div>
              <p className="text-xs text-muted-foreground">
                Verified and active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {typeof stats.completionRate === 'number' ? stats.completionRate.toFixed(1) : stats.completionRate || '0.0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Job completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Contractors ({contractors.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval ({pendingContractors.length})</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={exportContractors} 
            disabled={exporting}
            variant="outline"
          >
            {exporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contractors by name, business, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by approval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Approved</SelectItem>
                    <SelectItem value="false">Not Approved</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setTierFilter('all')
                    setApprovalFilter('all')
                    setPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contractors List */}
          <div className="space-y-4">
            {contractors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No contractors found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              contractors.map((contractor) => (
                <Card key={contractor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getInitials(contractor.businessName || contractor.user?.name || 'CN')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {contractor.businessName || contractor.user?.name}
                            </h3>
                            {getTierBadge(contractor.tier)}
                            {getStatusBadge(contractor)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{contractor.user?.email}</span>
                            <span>•</span>
                            <span>{contractor.city || 'Location not set'}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{contractor.averageRating?.toFixed(1) || 'No rating'}</span>
                              <span className="ml-1">({contractor.reviewCount || 0} reviews)</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{contractor.jobsCompleted || 0} jobs completed</span>
                            <span>•</span>
                            <span>Joined {new Date(contractor.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <CreditCard className="h-3 w-3 mr-1" />
                              <span className="font-medium text-blue-600">
                                {contractor.creditsBalance || 0} credits
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreditDialog(contractor)}
                          className="h-8 px-2"
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Credits: {contractor.creditsBalance || 0}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {!contractor.profileApproved && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => openApprovalDialog(contractor, true)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openApprovalDialog(contractor, false)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}

                            {contractor.profileApproved && contractor.status === 'VERIFIED' && (
                              <DropdownMenuItem
                                onClick={() => openStatusDialog(contractor, 'SUSPENDED')}
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            )}

                            {contractor.status === 'SUSPENDED' && (
                              <DropdownMenuItem
                                onClick={() => openStatusDialog(contractor, 'VERIFIED')}
                              >
                                <Activity className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openCreditDialog(contractor)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Manage Credits
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingContractors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                <p className="text-muted-foreground">
                  All contractor applications have been reviewed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingContractors.map((contractor) => (
                <Card key={contractor.id} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getInitials(contractor.businessName || contractor.user?.name || 'CN')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {contractor.businessName || contractor.user?.name}
                            </h3>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Approval
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{contractor.user?.email}</span>
                            <span>•</span>
                            <span>{contractor.city || 'Location not set'}</span>
                            <span>•</span>
                            <span>Applied {new Date(contractor.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {contractor.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {contractor.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApprovalDialog(contractor, false)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openApprovalDialog(contractor, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                    
                    {contractor.servicesProvided && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Services:</p>
                        <p className="text-sm">{contractor.servicesProvided}</p>
                      </div>
                    )}
                    
                    {contractor.yearsExperience && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Experience:</span> {contractor.yearsExperience}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalData.approved ? 'Approve' : 'Reject'} Contractor
            </DialogTitle>
            <DialogDescription>
              {approvalData.approved 
                ? `Approve ${selectedContractor?.businessName || selectedContractor?.user.name} as a verified contractor`
                : `Reject ${selectedContractor?.businessName || selectedContractor?.user.name}'s application`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedContractor && (
            <div className="space-y-4">
              {/* Contractor Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedContractor.user.email}</span>
                </div>
                {selectedContractor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContractor.phone}</span>
                  </div>
                )}
                {selectedContractor.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContractor.city}, {selectedContractor.postcode}</span>
                  </div>
                )}
                {selectedContractor.description && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Description:</p>
                    <p className="text-sm">{selectedContractor.description}</p>
                  </div>
                )}
              </div>

              {/* Reason */}
              {!approvalData.approved && (
                <div className="grid gap-2">
                  <Label htmlFor="reason">Rejection Reason *</Label>
                  <Textarea
                    id="reason"
                    value={approvalData.reason}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes for this decision..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprovalSubmit}
              disabled={processing || (!approvalData.approved && !approvalData.reason.trim())}
              className={approvalData.approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {approvalData.approved ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {approvalData.approved ? 'Approve' : 'Reject'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Contractor Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedContractor?.businessName || selectedContractor?.user.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={statusData.status} onValueChange={(value) => setStatusData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="statusReason">Reason (Optional)</Label>
              <Textarea
                id="statusReason"
                value={statusData.reason}
                onChange={(e) => setStatusData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for status change..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusSubmit}
              disabled={processing || !statusData.status}
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Adjustment Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Contractor Credits</DialogTitle>
            <DialogDescription>
              {selectedContractor ? 
                `Adjust credits for ${selectedContractor.businessName || selectedContractor.user.name}` :
                'Adjust contractor credits'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedContractor && (
            <div className="space-y-4">
              {/* Current Credit Information */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Credits:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {selectedContractor.creditsBalance || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Weekly Limit:</span>
                  <span>{selectedContractor.weeklyCreditsLimit || 3}</span>
                </div>
              </div>

              {/* Credit Adjustment Form */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Action</Label>
                  <Select 
                    value={creditData.type} 
                    onValueChange={(value: 'ADDITION' | 'DEDUCTION') => 
                      setCreditData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADDITION">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-green-600" />
                          Add Credits
                        </div>
                      </SelectItem>
                      <SelectItem value="DEDUCTION">
                        <div className="flex items-center">
                          <Minus className="h-4 w-4 mr-2 text-red-600" />
                          Remove Credits
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="creditAmount">Amount</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    min="1"
                    max={creditData.type === 'DEDUCTION' ? selectedContractor.creditsBalance : 50}
                    value={creditData.amount}
                    onChange={(e) => setCreditData(prev => ({ 
                      ...prev, 
                      amount: parseInt(e.target.value) || 1 
                    }))}
                    placeholder="Number of credits"
                  />
                  {creditData.type === 'DEDUCTION' && creditData.amount > (selectedContractor.creditsBalance || 0) && (
                    <p className="text-sm text-red-600">
                      Cannot remove more credits than available ({selectedContractor.creditsBalance || 0})
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="creditReason">Reason *</Label>
                  <Textarea
                    id="creditReason"
                    value={creditData.reason}
                    onChange={(e) => setCreditData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for credit adjustment (required)..."
                    rows={3}
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <p className="text-sm text-muted-foreground">
                    {creditData.type === 'ADDITION' ? 'Add' : 'Remove'} {creditData.amount} credit{creditData.amount !== 1 ? 's' : ''}
                    {creditData.type === 'ADDITION' ? ' to' : ' from'} {selectedContractor.businessName || selectedContractor.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    New balance: {
                      creditData.type === 'ADDITION' 
                        ? (selectedContractor.creditsBalance || 0) + creditData.amount
                        : Math.max(0, (selectedContractor.creditsBalance || 0) - creditData.amount)
                    } credits
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreditDialog(false)
                setCreditData({ type: 'ADDITION', amount: 1, reason: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreditAdjustment}
              disabled={
                processing || 
                !creditData.reason.trim() || 
                creditData.amount < 1 ||
                (creditData.type === 'DEDUCTION' && creditData.amount > (selectedContractor?.creditsBalance || 0))
              }
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {creditData.type === 'ADDITION' ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Minus className="mr-2 h-4 w-4" />
                  )}
                  {creditData.type === 'ADDITION' ? 'Add' : 'Remove'} Credits
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 