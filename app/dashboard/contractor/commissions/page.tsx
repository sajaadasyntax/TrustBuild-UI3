'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Search,
  FileText,
  Info,
  ArrowRight,
  CreditCard
} from 'lucide-react'
import { paymentsApi, handleApiError } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'

interface CommissionPayment {
  id: string
  jobId: string
  finalJobAmount: number
  commissionRate: number
  commissionAmount: number
  vatAmount: number
  totalAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  createdAt: string
  paidAt?: string
  job: {
    id: string
    title: string
    completionDate?: string
  }
  invoice?: {
    invoiceNumber: string
  }
}

export default function ContractorCommissions() {
  const { user, isAuthenticated } = useAuth()
  const [commissions, setCommissions] = useState<CommissionPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCommission, setSelectedCommission] = useState<CommissionPayment | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [payingCommission, setPayingCommission] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CONTRACTOR') {
      fetchCommissions()
    }
  }, [page, searchTerm, statusFilter, isAuthenticated, user])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 10
      }
      
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== 'all') params.status = statusFilter
      
      const response = await paymentsApi.getCommissionPayments(params)
      // Handle both response formats
      if (Array.isArray(response)) {
        // Direct array response
        setCommissions(response)
        // @ts-ignore - pagination might be attached to the array
        setTotalPages(response.pagination?.pages || 1)
      } else if (response && typeof response === 'object') {
        // Object response with data property
        if (response.data && Array.isArray(response.data.commissions)) {
          setCommissions(response.data.commissions)
          setTotalPages(response.data.pagination?.pages || 1)
        } else if (Array.isArray(response.data)) {
          setCommissions(response.data)
          // @ts-ignore - pagination might be attached to the response
          setTotalPages(response.pagination?.pages || 1)
        } else {
          setCommissions([])
          setTotalPages(1)
        }
      } else {
        setCommissions([])
        setTotalPages(1)
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch commission payments')
      setCommissions([])
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentIntent = async () => {
    if (!selectedCommission) return

    try {
      setPayingCommission(true)
      // Create payment intent
      const response = await paymentsApi.createCommissionPaymentIntent({
        commissionPaymentId: selectedCommission.id
      })

      // Redirect to Stripe checkout
      if (response.clientSecret) {
        // In a production app, you would use Stripe Elements or redirect to Stripe hosted checkout
        // For now, we'll simulate a successful payment
        await handleCompletePayment(response.clientSecret)
      }
    } catch (error) {
      handleApiError(error, 'Failed to create payment intent')
    } finally {
      setPayingCommission(false)
    }
  }

  const handleCompletePayment = async (paymentIntentId: string) => {
    if (!selectedCommission) return

    try {
      await paymentsApi.payCommission({
        commissionPaymentId: selectedCommission.id,
        stripePaymentIntentId: paymentIntentId
      })
      
      toast({
        title: "Payment Complete",
        description: `Successfully paid commission for ${selectedCommission.job.title}`,
      })
      
      setShowPaymentDialog(false)
      await fetchCommissions()
    } catch (error) {
      handleApiError(error, 'Failed to complete payment')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'WAIVED':
        return <Badge className="bg-blue-100 text-blue-800">Waived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMs = due.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Overdue'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`
  }

  // Filter commissions based on search and status
  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = 
      commission.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (commission.invoice?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (user.role !== 'CONTRACTOR') {
    return (
      <div className="container py-32">
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
    <div className="container py-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Commission Payments</h1>
        <p className="text-muted-foreground">
          View and manage your 5% commission payments on completed job amounts
        </p>
      </div>

      {/* Commission Explanation */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Subscription Commission System</CardTitle>
          <CardDescription>
            As a subscribed contractor, you get 3 weekly credit points for free job access, then pay 5% commission on the final job amount after completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">Your active subscription gives you 3 weekly credit points for free job access. 
              You can also choose to pay the lead price instead. Commission only applies when using credits - 5% on the final job amount after completion.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-sm">5% commission on final job amount</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-sm">48-hour payment window</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-2">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-sm">Secure online payment</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by job title or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="WAIVED">Waived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button onClick={fetchCommissions} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Commission Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Loading commission payments...</p>
        </div>
      ) : filteredCommissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Commission Payments</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any commission payments yet.
              They will appear here after completing jobs as a subscribed contractor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{commission.job.title}</TableCell>
                    <TableCell>{formatCurrency(commission.finalJobAmount)}</TableCell>
                    <TableCell>{formatCurrency(commission.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(commission.dueDate).toLocaleDateString()}</span>
                        {commission.status === 'PENDING' && (
                          <span className="text-xs text-muted-foreground">
                            {getTimeRemaining(commission.dueDate)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {commission.status === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedCommission(commission)
                            setShowPaymentDialog(true)
                          }}
                        >
                          Pay Now
                        </Button>
                      )}
                      {commission.status === 'PAID' && (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Paid on {new Date(commission.paidAt || '').toLocaleDateString()}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-center py-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    {page > 1 ? (
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                      />
                    ) : (
                      <PaginationPrevious 
                        className="pointer-events-none opacity-50"
                        onClick={() => {}}
                      />
                    )}
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        isActive={page === p}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    {page < totalPages ? (
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      />
                    ) : (
                      <PaginationNext 
                        className="pointer-events-none opacity-50"
                        onClick={() => {}}
                      />
                    )}
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Commission</DialogTitle>
            <DialogDescription>
              Complete your commission payment for the completed job.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCommission && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job:</span>
                  <span className="font-medium">{selectedCommission.job.title}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedCommission.finalJobAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission (5%):</span>
                  <span className="font-medium">{formatCurrency(selectedCommission.commissionAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%):</span>
                  <span className="font-medium">{formatCurrency(selectedCommission.vatAmount)}</span>
                </div>
                
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Due:</span>
                  <span>{formatCurrency(selectedCommission.totalAmount)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="text-red-600 font-medium">
                    {new Date(selectedCommission.dueDate).toLocaleDateString()} 
                    ({getTimeRemaining(selectedCommission.dueDate)})
                  </span>
                </div>
              </div>
              
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Commission payments must be completed within 48 hours to maintain your account in good standing.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={payingCommission}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentIntent}
              disabled={payingCommission}
            >
              {payingCommission ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {selectedCommission && formatCurrency(selectedCommission.totalAmount)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
