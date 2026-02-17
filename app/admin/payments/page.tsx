"use client"

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AdminSubscriptionManager from '@/components/subscription/AdminSubscriptionManager'
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  User,
  Calendar,
  Banknote
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { adminApi } from '@/lib/adminApi'
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

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  averageTransactionValue: number;
  revenueGrowth: number;
  subscriptionRevenue: number;
  jobPaymentRevenue: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  customer: {
    name: string;
    email: string;
  };
  contractor?: {
    businessName: string;
    user: {
      name: string;
    };
  };
  description: string;
  createdAt: string;
  stripePaymentId: string;
}

// Refunds Tab — shows all refunded transactions
function RefundsTab({ 
  formatCurrency, 
  getStatusBadge,
  getTypeBadge,
  openTransactionDialog,
}: { 
  formatCurrency: (amount: number, currency?: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  getTypeBadge: (type: string) => React.ReactNode
  openTransactionDialog: (transaction: Transaction) => void
}) {
  const [refundedTransactions, setRefundedTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refundPage, setRefundPage] = useState(1)
  const [refundTotalPages, setRefundTotalPages] = useState(1)

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminApi.getPaymentTransactions({
        page: refundPage,
        limit: 20,
        status: 'refunded',
      })
      setRefundedTransactions(response.data.transactions || [])
      setRefundTotalPages(response.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching refunds:', error)
    } finally {
      setLoading(false)
    }
  }, [refundPage])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownRight className="h-5 w-5" />
          Refund History
        </CardTitle>
        <CardDescription>All refunded transactions with admin audit trail</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading refunds...</span>
          </div>
        ) : refundedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Refunds Yet</h3>
            <p className="text-muted-foreground">
              When payments are refunded they will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">#{transaction.id}</p>
                        <p className="text-xs text-muted-foreground">{transaction.stripePaymentId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{transaction.customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openTransactionDialog(transaction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {refundTotalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4 px-6">
                <div className="text-sm text-muted-foreground">
                  Page {refundPage} of {refundTotalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefundPage(refundPage - 1)}
                    disabled={refundPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefundPage(refundPage + 1)}
                    disabled={refundPage >= refundTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function AdminPaymentsContent() {
  const searchParams = useSearchParams()
  const { admin, loading: authLoading } = useAdminAuth()
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('transactions')

  // Refund state
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundTransaction, setRefundTransaction] = useState<Transaction | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [isFullRefund, setIsFullRefund] = useState(true)
  const [processingRefund, setProcessingRefund] = useState(false)
  
  // Set active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['transactions', 'subscriptions', 'refunds'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchPaymentStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      // Use real API to fetch payment statistics
      const stats = await adminApi.getPaymentStats()
      setStats(stats)
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch payment statistics',
        variant: 'destructive',
      })
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      // Use real API to fetch payment transactions
      const response = await adminApi.getPaymentTransactions({
        page,
        limit: 20,
        status: statusFilter,
        type: typeFilter,
        search: debouncedSearchTerm,
        dateFilter
      })
      setTransactions(response.data.transactions)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, typeFilter, debouncedSearchTerm, dateFilter])

  useEffect(() => {
    // Wait for authentication to be ready before fetching data
    if (!authLoading && admin) {
      fetchPaymentStats()
      fetchTransactions()
    }
  }, [page, searchTerm, statusFilter, typeFilter, dateFilter, admin, authLoading, fetchPaymentStats, fetchTransactions])

  const exportTransactions = async () => {
    try {
      setExporting(true)
      
      // Create CSV content
      const headers = [
        'Transaction ID', 'Stripe Payment ID', 'Amount', 'Currency', 'Status', 'Type',
        'Customer Name', 'Customer Email', 'Contractor', 'Description', 'Date'
      ]

      const csvContent = [
        headers.join(','),
        ...transactions.map((transaction) => [
          transaction.id,
          transaction.stripePaymentId,
          transaction.amount,
          transaction.currency,
          transaction.status,
          transaction.type,
          `"${transaction.customer.name}"`,
          transaction.customer.email,
          `"${transaction.contractor?.businessName || 'N/A'}"`,
          `"${transaction.description}"`,
          new Date(transaction.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Successful',
        description: `Exported ${transactions.length} transactions to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export transactions',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  // --- Refund logic ---
  const openRefundDialog = (transaction: Transaction) => {
    setRefundTransaction(transaction)
    setRefundReason('')
    setRefundAmount('')
    setIsFullRefund(true)
    setShowRefundDialog(true)
  }

  const handleProcessRefund = async () => {
    if (!refundTransaction) return
    if (!refundReason.trim()) {
      toast({ title: 'Validation Error', description: 'Please provide a reason for the refund.', variant: 'destructive' })
      return
    }
    if (!isFullRefund && (!refundAmount || Number(refundAmount) <= 0)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid partial refund amount.', variant: 'destructive' })
      return
    }
    if (!isFullRefund && Number(refundAmount) > refundTransaction.amount) {
      toast({ title: 'Validation Error', description: 'Partial refund amount cannot exceed the transaction amount.', variant: 'destructive' })
      return
    }

    try {
      setProcessingRefund(true)
      const payload: { reason: string; amount?: number } = { reason: refundReason.trim() }
      if (!isFullRefund) {
        payload.amount = Number(refundAmount)
      }

      const result = await adminApi.refundPayment(refundTransaction.id, payload)
      
      toast({
        title: 'Refund Processed',
        description: result.message || `Refund of ${formatCurrency(isFullRefund ? refundTransaction.amount : Number(refundAmount))} was successful.`,
      })
      setShowRefundDialog(false)
      setShowTransactionDialog(false)
      // Refresh data
      fetchPaymentStats()
      fetchTransactions()
    } catch (error: any) {
      console.error('Refund error:', error)
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessingRefund(false)
    }
  }

  const canRefund = (transaction: Transaction) => {
    return transaction.status === 'succeeded' || transaction.status === 'completed'
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Succeeded</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800"><ArrowDownRight className="h-3 w-3 mr-1" />Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'subscription':
        return <Badge className="bg-purple-100 text-purple-800">Subscription</Badge>
      case 'job_payment':
        return <Badge className="bg-blue-100 text-blue-800">Job Payment</Badge>
      case 'job_unlock':
        return <Badge className="bg-orange-100 text-orange-800">Job Unlock</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const openTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDialog(true)
  }

  // Authentication check
  if (!admin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Check if admin has payment permissions
  const hasPaymentAccess = admin.role === 'SUPER_ADMIN' || 
                          admin.role === 'FINANCE_ADMIN' || 
                          (admin.permissions && admin.permissions.some(perm => 
                            perm.startsWith('payments:')
                          ))

  if (!hasPaymentAccess) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You do not have permission to access payment data.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">
          Monitor Stripe payments, subscriptions, and transaction data
        </p>
      </div>

      {/* Payment Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +{stats.revenueGrowth}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Current month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulPayments} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.successfulPayments / stats.totalTransactions) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.failedPayments} failed payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm">Subscriptions</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats.subscriptionRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Job Payments</span>
                  </div>
                  <span className="font-medium">{formatCurrency(stats.jobPaymentRevenue)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Average Transaction</span>
                  <span className="font-bold">{formatCurrency(stats.averageTransactionValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Transaction status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Successful</span>
                  </div>
                  <span className="font-medium">{stats.successfulPayments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-medium">{stats.failedPayments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{stats.pendingPayments}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={exportTransactions} 
            disabled={exporting}
            variant="outline"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 md:mr-2 animate-spin" />
                <span className="hidden md:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Export CSV</span>
              </>
            )}
          </Button>
        </div>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer, amount, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value) => {
                  setTypeFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="subscription">Subscriptions</SelectItem>
                    <SelectItem value="job_payment">Job Payments</SelectItem>
                    <SelectItem value="job_unlock">Job Unlocks</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={(value) => {
                  setDateFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                    setDateFilter('all')
                    setPage(1)
                  }}
                  disabled={loading}
                >
                  Clear Filters
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    fetchPaymentStats()
                    fetchTransactions()
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions from Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && transactions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading transactions...</span>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No transactions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">#{transaction.id}</p>
                            <p className="text-xs text-muted-foreground">{transaction.stripePaymentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{transaction.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openTransactionDialog(transaction)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                View in Stripe
                              </DropdownMenuItem>
                              {canRefund(transaction) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openRefundDialog(transaction)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <ArrowDownRight className="mr-2 h-4 w-4" />
                                    Issue Refund
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <div className="flex items-center justify-between space-x-2 py-4 px-6">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <AdminSubscriptionManager />
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <RefundsTab 
            formatCurrency={formatCurrency} 
            getStatusBadge={getStatusBadge} 
            getTypeBadge={getTypeBadge}
            openTransactionDialog={openTransactionDialog}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information for transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p>{selectedTransaction.customer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p>{selectedTransaction.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Stripe Payment ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.stripePaymentId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <div className="mt-1">
                    {getTypeBadge(selectedTransaction.type)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p>{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.contractor && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Contractor Information</h4>
                  <p><strong>Business:</strong> {selectedTransaction.contractor.businessName}</p>
                  <p><strong>Owner:</strong> {selectedTransaction.contractor.user.name}</p>
                </div>
              )}

              {/* Refund Action */}
              {canRefund(selectedTransaction) && (
                <div className="border-t pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => openRefundDialog(selectedTransaction)}
                    className="w-full"
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Refund This Payment
                  </Button>
                </div>
              )}

              {selectedTransaction.status === 'refunded' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <ArrowDownRight className="h-4 w-4" />
                    <span className="font-medium">This payment has been refunded</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Process Refund
            </DialogTitle>
            <DialogDescription>
              This action will refund money to the customer via Stripe and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {refundTransaction && (
            <div className="space-y-4">
              {/* Transaction summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction</span>
                  <span className="font-mono">#{refundTransaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span>{refundTransaction.customer.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-bold">{formatCurrency(refundTransaction.amount, refundTransaction.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stripe ID</span>
                  <span className="font-mono text-xs">{refundTransaction.stripePaymentId}</span>
                </div>
              </div>

              {/* Refund type */}
              <div className="space-y-2">
                <Label>Refund Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="refundType"
                      checked={isFullRefund}
                      onChange={() => { setIsFullRefund(true); setRefundAmount('') }}
                      className="accent-red-600"
                    />
                    <span className="text-sm">Full Refund ({formatCurrency(refundTransaction.amount, refundTransaction.currency)})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="refundType"
                      checked={!isFullRefund}
                      onChange={() => setIsFullRefund(false)}
                      className="accent-red-600"
                    />
                    <span className="text-sm">Partial Refund</span>
                  </label>
                </div>
              </div>

              {/* Partial amount input */}
              {!isFullRefund && (
                <div className="space-y-2">
                  <Label htmlFor="refund-amount">Refund Amount ({refundTransaction.currency.toUpperCase()})</Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={refundTransaction.amount}
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatCurrency(refundTransaction.amount, refundTransaction.currency)}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="refund-reason">Reason for Refund *</Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Explain why this refund is being issued..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    This will initiate a{' '}
                    <strong>
                      {isFullRefund ? 'full' : `partial (${formatCurrency(Number(refundAmount) || 0, refundTransaction.currency)})`}
                    </strong>{' '}
                    refund through Stripe. The funds will be returned to the customer's original payment method. 
                    This action will be logged with your admin credentials.
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRefundDialog(false)}
                  disabled={processingRefund}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleProcessRefund}
                  disabled={processingRefund || !refundReason.trim()}
                >
                  {processingRefund ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="mr-2 h-4 w-4" />
                      Confirm Refund
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminPayments() {
  return (
    <Suspense fallback={
      <div className="container py-32">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <AdminPaymentsContent />
    </Suspense>
  )
} 