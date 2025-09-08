import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  RefreshCw,
  Search,
  Download,
  UserCheck,
  Building,
  Users,
  Zap,
  Activity,
  Filter,
  Edit,
  PlusCircle,
  Eye
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { adminApi, handleApiError } from '@/lib/api'

interface Subscription {
  id: string
  contractorId: string
  tier: string
  plan: string
  status: string
  isActive: boolean
  stripeSubscriptionId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  monthlyPrice: number
  contractor?: {
    businessName?: string
    user: {
      name: string
      email: string
    }
  }
}

interface SubscriptionSummary {
  activeSubscriptions: number
  pendingSubscriptions: number
  trialSubscriptions: number
  cancelledSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
  averageSubscriptionValue: number
  subscriptionByPlan: {
    plan: string
    count: number
    revenue: number
  }[]
  recentSubscriptions: Subscription[]
}

interface SubscriptionFilters {
  page: number
  limit: number
  status: string
  plan: string
  search: string
}

export default function AdminSubscriptionManager() {
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filters, setFilters] = useState<SubscriptionFilters>({
    page: 1,
    limit: 10,
    status: 'all',
    plan: 'all',
    search: ''
  })
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchSubscriptionStats()
    fetchSubscriptions()
  }, [filters.page, filters.status, filters.plan])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search) {
        fetchSubscriptions()
      }
    }, 500) // Debounce search

    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchSubscriptionStats = async () => {
    try {
      setStatsLoading(true)
      const response = await adminApi.getSubscriptionStats()
      setSummary(response)
    } catch (error) {
      handleApiError(error, 'Failed to fetch subscription statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getSubscriptions(filters)
      setSubscriptions(response.data.subscriptions)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      handleApiError(error, 'Failed to fetch subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    fetchSubscriptions()
  }

  const exportSubscriptions = async () => {
    try {
      setExporting(true)
      
      // Create CSV content
      const headers = [
        'ID', 'Contractor Name', 'Email', 'Plan', 'Status', 
        'Start Date', 'End Date', 'Monthly Price', 'Stripe ID'
      ]

      const csvContent = [
        headers.join(','),
        ...subscriptions.map((sub) => [
          sub.id,
          `"${sub.contractor?.businessName || sub.contractor?.user.name || 'Unknown'}"`,
          `"${sub.contractor?.user.email || 'Unknown'}"`,
          sub.plan,
          sub.status,
          new Date(sub.currentPeriodStart).toLocaleDateString(),
          new Date(sub.currentPeriodEnd).toLocaleDateString(),
          sub.monthlyPrice,
          sub.stripeSubscriptionId || 'N/A'
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Exported ${subscriptions.length} subscriptions to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export subscriptions',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'MONTHLY':
        return <Badge className="bg-blue-100 text-blue-800">Monthly</Badge>
      case 'SIX_MONTHS':
        return <Badge className="bg-purple-100 text-purple-800">6-Month</Badge>
      case 'YEARLY':
        return <Badge className="bg-green-100 text-green-800">Yearly</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive && status === 'active') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
    } else if (status === 'cancelled') {
      return <Badge className="bg-orange-100 text-orange-800">Cancelled</Badge>
    } else if (status === 'past_due') {
      return <Badge className="bg-red-100 text-red-800">Past Due</Badge>
    } else if (status === 'trialing') {
      return <Badge className="bg-purple-100 text-purple-800">Trial</Badge>
    } else {
      return <Badge variant="outline">{status}</Badge>
    }
  }

  const viewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setShowSubscriptionDialog(true)
  }

  const cancelSubscription = async (subscription: Subscription) => {
    if (!confirm(`Are you sure you want to cancel the subscription for ${subscription.contractor?.businessName || subscription.contractor?.user.name}?`)) {
      return
    }

    try {
      setActionInProgress(true)
      await adminApi.cancelContractorSubscription(subscription.contractorId)
      
      toast({
        title: 'Subscription Cancelled',
        description: 'The subscription has been cancelled successfully',
      })
      
      // Refresh data
      fetchSubscriptions()
      fetchSubscriptionStats()
      setShowSubscriptionDialog(false)
    } catch (error) {
      handleApiError(error, 'Failed to cancel subscription')
    } finally {
      setActionInProgress(false)
    }
  }

  const reactivateSubscription = async (subscription: Subscription) => {
    try {
      setActionInProgress(true)
      await adminApi.reactivateContractorSubscription(subscription.contractorId)
      
      toast({
        title: 'Subscription Reactivated',
        description: 'The subscription has been reactivated successfully',
      })
      
      // Refresh data
      fetchSubscriptions()
      fetchSubscriptionStats()
      setShowSubscriptionDialog(false)
    } catch (error) {
      handleApiError(error, 'Failed to reactivate subscription')
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Subscription Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {summary.activeSubscriptions > 0 
                  ? `${((summary.activeSubscriptions / (summary.activeSubscriptions + summary.cancelledSubscriptions)) * 100).toFixed(1)}% retention rate` 
                  : 'No active subscriptions'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From {summary.activeSubscriptions} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime subscription revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Value</CardTitle>
              <Building className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.averageSubscriptionValue)}</div>
              <p className="text-xs text-muted-foreground">
                Per subscription
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Subscriptions</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={exportSubscriptions} 
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

        <TabsContent value="all">
          <SubscriptionTable 
            subscriptions={subscriptions}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            totalPages={totalPages}
            handleSearch={handleSearch}
            viewSubscription={viewSubscription}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="active">
          <SubscriptionTable 
            subscriptions={subscriptions.filter(s => s.isActive && s.status === 'active')}
            loading={loading}
            filters={{...filters, status: 'active'}}
            setFilters={setFilters}
            totalPages={totalPages}
            handleSearch={handleSearch}
            viewSubscription={viewSubscription}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="cancelled">
          <SubscriptionTable 
            subscriptions={subscriptions.filter(s => s.status === 'cancelled')}
            loading={loading}
            filters={{...filters, status: 'cancelled'}}
            setFilters={setFilters}
            totalPages={totalPages}
            handleSearch={handleSearch}
            viewSubscription={viewSubscription}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="expired">
          <SubscriptionTable 
            subscriptions={subscriptions.filter(s => !s.isActive && s.status !== 'cancelled')}
            loading={loading}
            filters={{...filters, status: 'expired'}}
            setFilters={setFilters}
            totalPages={totalPages}
            handleSearch={handleSearch}
            viewSubscription={viewSubscription}
            getPlanBadge={getPlanBadge}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>

      {/* Subscription Details Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Complete information about this subscription
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              {/* Subscription Overview */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSubscription.contractor?.businessName || 'Unknown Business'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSubscription.contractor?.user.email}</p>
                </div>
                <div>
                  {getStatusBadge(selectedSubscription.status, selectedSubscription.isActive)}
                  <div className="mt-2">
                    {getPlanBadge(selectedSubscription.plan)}
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p>{formatDate(selectedSubscription.currentPeriodStart)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p>{formatDate(selectedSubscription.currentPeriodEnd)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Monthly Price</Label>
                  <p>{formatCurrency(selectedSubscription.monthlyPrice)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Contractor Tier</Label>
                  <p>{selectedSubscription.tier}</p>
                </div>
              </div>

              {/* Stripe ID */}
              {selectedSubscription.stripeSubscriptionId && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Stripe Subscription ID</Label>
                  <p className="font-mono text-sm">{selectedSubscription.stripeSubscriptionId}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSubscriptionDialog(false)}
                >
                  Close
                </Button>
                
                {selectedSubscription.status === 'active' && selectedSubscription.isActive ? (
                  <Button 
                    variant="destructive"
                    onClick={() => cancelSubscription(selectedSubscription)}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                ) : selectedSubscription.status === 'cancelled' ? (
                  <Button
                    onClick={() => reactivateSubscription(selectedSubscription)}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Reactivate Subscription'
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Subscription Table Component
interface SubscriptionTableProps {
  subscriptions: Subscription[]
  loading: boolean
  filters: SubscriptionFilters
  setFilters: React.Dispatch<React.SetStateAction<SubscriptionFilters>>
  totalPages: number
  handleSearch: (e: React.FormEvent) => void
  viewSubscription: (subscription: Subscription) => void
  getPlanBadge: (plan: string) => JSX.Element
  getStatusBadge: (status: string, isActive: boolean) => JSX.Element
  formatDate: (dateStr: string) => string
}

const SubscriptionTable = ({
  subscriptions,
  loading,
  filters,
  setFilters,
  totalPages,
  handleSearch,
  viewSubscription,
  getPlanBadge,
  getStatusBadge,
  formatDate
}: SubscriptionTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          View and manage contractor subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by contractor name or email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </form>
          
          <Select value={filters.plan} onValueChange={(value) => setFilters(prev => ({ ...prev, plan: value, page: 1 }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="SIX_MONTHS">6-Month</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setFilters({
                page: 1,
                limit: 10,
                status: 'all',
                plan: 'all',
                search: ''
              })
            }}
            className="whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        {/* Subscriptions Table */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading subscriptions...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No subscriptions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="font-medium">{subscription.contractor?.businessName || 'Unknown Business'}</div>
                        <div className="text-sm text-muted-foreground">{subscription.contractor?.user.email}</div>
                      </TableCell>
                      <TableCell>
                        {getPlanBadge(subscription.plan)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status, subscription.isActive)}
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.currentPeriodStart)}
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.currentPeriodEnd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => viewSubscription(subscription)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Page {filters.page} of {totalPages}
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={filters.page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
