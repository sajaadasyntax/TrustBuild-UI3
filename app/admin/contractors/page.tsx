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
  UserX
} from 'lucide-react'
import { contractorsApi, adminApi, handleApiError, Contractor } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'

export default function AdminContractors() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [pendingContractors, setPendingContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchContractors()
    fetchPendingContractors()
  }, [page, searchTerm, statusFilter, tierFilter])

  const fetchContractors = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 20,
      }

      if (searchTerm) params.search = searchTerm
      if (tierFilter !== 'all') params.tier = tierFilter

      const response = await contractorsApi.getAll(params)
      setContractors(response.data.contractors || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      handleApiError(error, 'Failed to fetch contractors')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingContractors = async () => {
    try {
      const response = await adminApi.getPendingContractors({ limit: 10 })
      setPendingContractors(response.data.contractors || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch pending contractors')
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
    } catch (error) {
      handleApiError(error, `Failed to ${approved ? 'approve' : 'reject'} contractor`)
    }
  }

  const getStatusBadge = (contractor: Contractor) => {
    if (!contractor.profileApproved) {
      return <Badge variant="secondary">Pending</Badge>
    }
    
    switch (contractor.status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
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
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Contractors ({contractors.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingContractors.length})</TabsTrigger>
        </TabsList>

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
                
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setTierFilter('all')
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
            {contractors.map((contractor) => (
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
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                                onClick={() => handleApproval(contractor.id, true)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleApproval(contractor.id, false)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {contractor.status === 'active' && (
                            <DropdownMenuItem>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                          onClick={() => handleApproval(contractor.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproval(contractor.id, true)}
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
    </div>
  )
} 