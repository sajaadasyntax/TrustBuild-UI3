"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  Wallet,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  Banknote,
  Plus,
  Eye,
  MoreHorizontal,
  Star,
  Award,
  Target,
  Receipt
} from 'lucide-react'
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
import { contractorsApi, paymentsApi, handleApiError } from '@/lib/api'

interface ContractorEarnings {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayments: number;
  availableBalance: number;
  totalWithdrawn: number;
  subscriptionCost: number;
  subscriptionStatus: string;
  nextBillingDate: string;
  jobsCompleted: number;
  averageJobValue: number;
  creditsBalance: number;
  weeklyCreditsLimit: number;
  nextCreditReset?: string;
}

interface PaymentTransaction {
  id: string;
  type: 'job_payment' | 'subscription' | 'withdrawal' | 'fee' | 'lead_access' | 'credit_reset';
  amount: number;
  currency: string;
  status: string;
  description: string;
  customer?: {
    name: string;
    email: string;
  };
  job?: {
    title: string;
    id: string;
  };
  createdAt: string;
  stripeTransactionId?: string;
  creditUsed?: boolean;
}

export default function ContractorPayments() {
  const { user, isAuthenticated } = useAuth()
  const [earnings, setEarnings] = useState<ContractorEarnings | null>(null)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [checkingCredits, setCheckingCredits] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CONTRACTOR') {
      fetchEarnings()
      fetchTransactions()
      checkCreditReset()
    }
  }, [page, searchTerm, statusFilter, typeFilter, isAuthenticated, user])

  const checkCreditReset = async () => {
    try {
      setCheckingCredits(true)
      // Check for credit reset using real API
      const resetResult = await contractorsApi.checkCreditReset()
      
      if (resetResult.creditsReset) {
        toast({
          title: "Credits Reset!",
          description: resetResult.message || "Your weekly credits have been refreshed",
        })
        fetchEarnings()
      }
    } catch (error) {
      console.warn('Credit reset check failed:', error)
    } finally {
      setCheckingCredits(false)
    }
  }

  const fetchEarnings = async () => {
    try {
      setStatsLoading(true)
      // Fetch real earnings data from API
      const earningsData = await contractorsApi.getMyEarnings()
      setEarnings({
        totalEarnings: earningsData.totalEarnings,
        monthlyEarnings: earningsData.monthlyEarnings,
        pendingPayments: earningsData.pendingPayments,
        availableBalance: earningsData.availableBalance,
        totalWithdrawn: earningsData.totalWithdrawn,
        subscriptionCost: earningsData.subscription?.amount || 29.99,
        subscriptionStatus: earningsData.subscription?.status || 'active',
        nextBillingDate: earningsData.subscription?.nextBillingDate || '2024-04-15',
        jobsCompleted: earningsData.jobsCompleted,
        averageJobValue: earningsData.averageJobValue,
        creditsBalance: earningsData.creditsBalance,
        weeklyCreditsLimit: earningsData.weeklyCreditsLimit,
        nextCreditReset: earningsData.nextCreditReset
      })
    } catch (error) {
      console.error('Error fetching earnings:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch earnings data',
        variant: 'destructive',
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // Fetch real payment history from API
      const paymentHistory = await paymentsApi.getPaymentHistory(page, 10)
      
      // Transform the payment data to match our interface
      const transformedTransactions: PaymentTransaction[] = paymentHistory.data.payments.map((payment: any) => ({
        id: payment.id,
        type: payment.type.toLowerCase() as any,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status.toLowerCase(),
        description: payment.description,
        job: payment.job ? {
          title: payment.job.title,
          id: payment.job.id
        } : undefined,
        createdAt: payment.createdAt,
        stripeTransactionId: payment.stripePaymentId,
        creditUsed: payment.type === 'LEAD_ACCESS'
      }))
      
      setTransactions(transformedTransactions)
      setTotalPages(paymentHistory.data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount',
        variant: 'destructive',
      })
      return
    }

    if (parseFloat(withdrawAmount) > (earnings?.availableBalance || 0)) {
      toast({
        title: 'Insufficient Balance',
        description: 'Withdrawal amount exceeds available balance',
        variant: 'destructive',
      })
      return
    }

    try {
      setWithdrawing(true)
      // Mock withdrawal - replace with actual Stripe Connect API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Withdrawal Initiated',
        description: `£${withdrawAmount} withdrawal has been initiated. Funds will arrive in 1-2 business days.`,
      })
      
      setWithdrawAmount('')
      setShowWithdrawDialog(false)
      fetchEarnings()
      fetchTransactions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process withdrawal',
        variant: 'destructive',
      })
    } finally {
      setWithdrawing(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTransactions()
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      // Mock export - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Export Complete',
        description: 'Transaction data has been exported to CSV',
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export transaction data',
        variant: 'destructive',
      })
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'GBP') => {
    if (currency === 'CREDITS') {
      return `${amount} Credit${Math.abs(amount) !== 1 ? 's' : ''}`
    }
    
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { text: 'Completed', className: 'bg-green-100 text-green-800' },
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      failed: { text: 'Failed', className: 'bg-red-100 text-red-800' },
      cancelled: { text: 'Cancelled', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { text: status, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      job_payment: { text: 'Job Payment', className: 'bg-blue-100 text-blue-800', icon: DollarSign },
      lead_access: { text: 'Lead Access', className: 'bg-purple-100 text-purple-800', icon: Eye },
      subscription: { text: 'Subscription', className: 'bg-orange-100 text-orange-800', icon: Calendar },
      withdrawal: { text: 'Withdrawal', className: 'bg-red-100 text-red-800', icon: ArrowDownRight },
      credit_reset: { text: 'Credit Reset', className: 'bg-green-100 text-green-800', icon: RefreshCw },
      fee: { text: 'Platform Fee', className: 'bg-gray-100 text-gray-800', icon: Banknote }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || { text: type, className: 'bg-gray-100 text-gray-800', icon: DollarSign }
    const IconComponent = config.icon
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getNextResetDate = () => {
    if (!earnings?.nextCreditReset) return 'Not available'
    
    const resetDate = new Date(earnings.nextCreditReset)
    const now = new Date()
    const daysLeft = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 0) return 'Reset available now'
    if (daysLeft === 1) return 'Tomorrow'
    return `In ${daysLeft} days`
  }

  // Authentication check
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

  if (user.role !== 'CONTRACTOR') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              This page is only available to contractors.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments & Earnings</h1>
        <p className="text-muted-foreground">
          Manage your earnings, withdrawals, and job lead credits
        </p>
      </div>

      {/* Credit System Overview */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.creditsBalance || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {earnings?.weeklyCreditsLimit || 3} weekly limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reset</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getNextResetDate()}</div>
            <p className="text-xs text-muted-foreground">
              Credits reset weekly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.jobsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(earnings?.averageJobValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Based on {earnings?.jobsCompleted || 0} jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.totalEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.monthlyEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {earnings?.jobsCompleted || 0} completed jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.availableBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.pendingPayments || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogTrigger asChild>
            <Button>
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Withdraw Earnings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Withdraw Earnings</DialogTitle>
              <DialogDescription>
                Enter the amount you&apos;d like to withdraw to your bank account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Available balance: {formatCurrency(earnings?.availableBalance || 0)}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdraw} disabled={withdrawing}>
                {withdrawing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Withdraw
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Data
        </Button>

        <Button variant="outline" onClick={fetchTransactions}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="credits">Credit History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Details</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your complete payment and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_payment">Job Payments</SelectItem>
                    <SelectItem value="lead_access">Lead Access</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="credit_reset">Credit Resets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading transactions...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
                              <p>No transactions found</p>
                              <p className="text-sm">Your payment history will appear here</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-sm">
                              {formatDate(transaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(transaction.type)}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate">{transaction.description}</div>
                              {transaction.job && (
                                <div className="text-xs text-muted-foreground">
                                  Job: {transaction.job.title}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                {transaction.amount > 0 ? '+' : ''}
                                {formatCurrency(transaction.amount, transaction.currency)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell className="text-right">
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
                                    View Details
                                  </DropdownMenuItem>
                                  {transaction.stripeTransactionId && (
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Receipt
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    Copy Transaction ID
                                  </DropdownMenuItem>
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
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage History</CardTitle>
              <CardDescription>
                Track your weekly credits and job lead purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p className="text-muted-foreground">Credit history will be displayed here</p>
                <p className="text-sm text-muted-foreground">
                  Track weekly resets and job lead purchases
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>
                Detailed view of your earnings by job and period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p className="text-muted-foreground">Earnings breakdown will be displayed here</p>
                <p className="text-sm text-muted-foreground">
                  View earnings by job, month, and category
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 