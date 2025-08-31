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
  Receipt,
  Calendar,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Building,
  Banknote,
  Plus,
  Eye,
  MoreHorizontal,
  FileText,
  Wallet
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
import { customersApi, handleApiError } from '@/lib/api'

interface ClientPaymentSummary {
  totalSpent: number;
  monthlySpent: number;
  pendingPayments: number;
  completedPayments: number;
  activeJobs: number;
  completedJobs: number;
  averageJobCost: number;
  savedPaymentMethods: number;
}

interface PaymentTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  contractor?: {
    businessName: string;
    user: { name: string };
  };
  job?: {
    title: string;
    id: string;
  };
  invoice?: {
    id: string;
    url?: string;
  };
  createdAt: string;
  stripePaymentId?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export default function ClientPayments() {
  const { user, isAuthenticated } = useAuth()
  const [paymentSummary, setPaymentSummary] = useState<ClientPaymentSummary | null>(null)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false)
  
  // Payment method form state
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    postalCode: '',
    nameOnCard: ''
  })

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CUSTOMER') {
      fetchPaymentSummary()
      fetchTransactions()
      fetchPaymentMethods()
    }
  }, [page, searchTerm, statusFilter, typeFilter, isAuthenticated, user])

  const fetchPaymentSummary = async () => {
    try {
      setStatsLoading(true)
      const summary = await customersApi.getClientPaymentSummary()
      setPaymentSummary(summary)
    } catch (error) {
      handleApiError(error, 'Failed to fetch payment summary')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await customersApi.getClientPaymentTransactions({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      }) as any
      setTransactions(response.data?.transactions || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const methods = await customersApi.getClientPaymentMethods()
      setPaymentMethods(methods || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch payment methods')
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await customersApi.getMyInvoices({
        page: 1,
        limit: 10
      })
      // For now, just show a message since invoices will be empty
      toast({
        title: 'Invoices Refreshed',
        description: 'Invoice data has been refreshed',
      })
    } catch (error) {
      handleApiError(error, 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const exportTransactions = async () => {
    try {
      setExporting(true)
      // For now, create a simple CSV export of current transactions
      const csv = [
        ['Date', 'Description', 'Type', 'Amount', 'Status'].join(','),
        ...transactions.map(t => [
          new Date(t.createdAt).toLocaleDateString(),
          `"${t.description}"`,
          t.type,
          `"${formatCurrency(t.amount, t.currency)}"`,
          t.status
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Success',
        description: 'Transactions exported successfully',
      })
    } catch (error) {
      handleApiError(error, 'Failed to export transactions')
    } finally {
      setExporting(false)
    }
  }

  const addPaymentMethod = async () => {
    setShowAddPaymentDialog(true)
  }

  const handleAddPaymentMethod = async () => {
    try {
      setAddingPaymentMethod(true)
      
      // Basic validation
      if (!paymentMethodForm.cardNumber || !paymentMethodForm.expiryDate || !paymentMethodForm.cvc) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }

      // For now, simulate adding a payment method since full Stripe integration isn't complete
      const mockPaymentMethod = {
        cardNumber: paymentMethodForm.cardNumber,
        expiryDate: paymentMethodForm.expiryDate,
        nameOnCard: paymentMethodForm.nameOnCard,
        postalCode: paymentMethodForm.postalCode
      }

      await customersApi.addPaymentMethod(mockPaymentMethod)
      
      toast({
        title: 'Success',
        description: 'Payment method added successfully',
      })
      
      setShowAddPaymentDialog(false)
      resetPaymentMethodForm()
      fetchPaymentMethods() // Refresh the list
    } catch (error) {
      handleApiError(error, 'Failed to add payment method')
    } finally {
      setAddingPaymentMethod(false)
    }
  }

  const resetPaymentMethodForm = () => {
    setPaymentMethodForm({
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      postalCode: '',
      nameOnCard: ''
    })
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '')
    }
    return v
  }

  const handlePaymentMethodInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }
    
    setPaymentMethodForm(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const formatCurrency = (amount?: number, currency = 'GBP') => {
    if (!amount && amount !== 0) return '£0.00'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, text: 'Completed', icon: CheckCircle },
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      failed: { variant: 'destructive' as const, text: 'Failed', icon: AlertCircle },
      refunded: { variant: 'outline' as const, text: 'Refunded', icon: ArrowUpRight }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      job_payment: { text: 'Job Payment', className: 'bg-blue-100 text-blue-800' },
      job_deposit: { text: 'Deposit', className: 'bg-green-100 text-green-800' },
      subscription: { text: 'Subscription', className: 'bg-purple-100 text-purple-800' },
      refund: { text: 'Refund', className: 'bg-orange-100 text-orange-800' },
      credit: { text: 'Credit', className: 'bg-yellow-100 text-yellow-800' },
      stripe: { text: 'Card Payment', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || { text: type, className: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const getCardBrand = (brand: string) => {
    const brandIcons: { [key: string]: string } = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      card: '💳'
    }
    return brandIcons[brand.toLowerCase()] || '💳'
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

  if (user.role !== 'CUSTOMER') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              This page is only available to customers.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments & Billing</h1>
        <p className="text-muted-foreground">
          Manage your payments, invoices, and billing information
        </p>
      </div>

      {/* Payment Summary */}
      {paymentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(paymentSummary.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {paymentSummary.completedJobs} jobs completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(paymentSummary.monthlySpent)}</div>
              <p className="text-xs text-muted-foreground">
                {paymentSummary.activeJobs} active jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(paymentSummary.pendingPayments)}</div>
              <p className="text-xs text-muted-foreground">
                Processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Job Cost</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(paymentSummary.averageJobCost)}</div>
              <p className="text-xs text-muted-foreground">
                Per project
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{getCardBrand(method.card.brand)}</div>
                    <div>
                      <p className="font-medium">•••• {method.card.last4}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {method.card.expMonth}/{method.card.expYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Set as Default</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addPaymentMethod}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest payment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={exportTransactions} 
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

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="job_payment">Job Payments</SelectItem>
                    <SelectItem value="job_deposit">Deposits</SelectItem>
                    <SelectItem value="subscription">Subscriptions</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Complete history of your payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No transactions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.contractor && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.contractor.businessName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {transaction.invoice && (
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Download Invoice
                                </DropdownMenuItem>
                              )}
                              {transaction.job && (
                                <DropdownMenuItem>
                                  <ArrowUpRight className="mr-2 h-4 w-4" />
                                  View Job
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Receipts</CardTitle>
              <CardDescription>Download and manage your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading invoices...</span>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Your invoices will appear here once you start making payments
                  </p>
                  <Button variant="outline" onClick={() => fetchInvoices()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Subscription Management</h3>
              <p className="text-muted-foreground">
                Manage your TrustBuild subscriptions and plans
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddPaymentDialog} onOpenChange={(open) => {
        setShowAddPaymentDialog(open)
        if (!open) {
          resetPaymentMethodForm()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account for future payments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name-on-card">
                Name on Card
              </Label>
              <Input
                id="name-on-card"
                type="text"
                placeholder="John Doe"
                value={paymentMethodForm.nameOnCard}
                onChange={(e) => handlePaymentMethodInputChange('nameOnCard', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="card-number">
                Card Number
              </Label>
              <Input
                id="card-number"
                type="text"
                placeholder="•••• •••• •••• ••••"
                value={paymentMethodForm.cardNumber}
                onChange={(e) => handlePaymentMethodInputChange('cardNumber', e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry-date">
                  Expiry Date
                </Label>
                <Input
                  id="expiry-date"
                  type="text"
                  placeholder="MM/YY"
                  value={paymentMethodForm.expiryDate}
                  onChange={(e) => handlePaymentMethodInputChange('expiryDate', e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">
                  CVC
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder="•••"
                  value={paymentMethodForm.cvc}
                  onChange={(e) => handlePaymentMethodInputChange('cvc', e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postal-code">
                Postal Code
              </Label>
              <Input
                id="postal-code"
                type="text"
                placeholder="SW1A 1AA"
                value={paymentMethodForm.postalCode}
                onChange={(e) => handlePaymentMethodInputChange('postalCode', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddPaymentDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod} disabled={addingPaymentMethod} className="flex-1">
              {addingPaymentMethod ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 