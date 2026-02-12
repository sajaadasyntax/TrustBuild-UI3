"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, FileText, Search, CreditCard, AlertCircle } from "lucide-react"
import { invoicesApi, handleApiError, getStoredToken } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ContractorInvoice {
  id: string
  invoiceNumber: string
  type: 'regular' | 'commission' | 'manual'
  description: string
  amount: number
  vatAmount: number
  totalAmount: number
  status: string
  dueDate?: string
  paidAt?: string
  issuedAt?: string
  createdAt: string
  items?: Array<{ description: string; amount: number; quantity: number }>
  isPayable?: boolean // Flag from backend indicating if invoice can be paid
}

// Manual Invoice Payment Form Component with Apple Pay and Google Pay support
function ManualInvoicePaymentForm({ 
  invoice, 
  onSuccess, 
  onCancel 
}: { 
  invoice: ContractorInvoice
  onSuccess: () => void
  onCancel: () => void 
}) {
  // NOTE: This outer component must NOT call useStripe()/useElements()
  // because it is rendered outside of an <Elements> provider.
  // Only the inner InvoicePaymentForm (wrapped in <Elements>) uses Stripe hooks.
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/payments/create-manual-invoice-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getStoredToken()}`
          },
          body: JSON.stringify({ manualInvoiceId: invoice.id })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to create payment intent')
        }

        setClientSecret(result.data.clientSecret)
      } catch (err: any) {
        console.error('Error creating payment intent:', err)
        setError(err.message || 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [invoice.id])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to initialize payment. Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10b981',
            fontFamily: 'system-ui, sans-serif',
          },
        },
      }}
    >
      <InvoicePaymentForm 
        invoice={invoice}
        onSuccess={onSuccess}
        onCancel={onCancel}
        error={error}
        setError={setError}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        clientSecret={clientSecret}
      />
    </Elements>
  )
}

// Inner payment form component that has access to Elements context
function InvoicePaymentForm({
  invoice,
  onSuccess,
  onCancel,
  error,
  setError,
  isProcessing,
  setIsProcessing,
  clientSecret,
}: {
  invoice: ContractorInvoice
  onSuccess: () => void
  onCancel: () => void
  error: string | null
  setError: (error: string | null) => void
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
  clientSecret: string
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/contractor/invoices?payment_success=true`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/payments/pay-manual-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getStoredToken()}`
          },
          body: JSON.stringify({
            manualInvoiceId: invoice.id,
            stripePaymentIntentId: paymentIntent.id
          })
        })

        if (!confirmResponse.ok) {
          const { message } = await confirmResponse.json()
          throw new Error(message || 'Failed to confirm payment')
        }

        onSuccess()
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Payment Method
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Pay securely with card, Apple Pay, or Google Pay
          </p>
          <PaymentElement />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between text-sm font-bold">
            <span>Total Due:</span>
            <span>£{invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing} className="flex-1">
          {isProcessing ? 'Processing...' : `Pay £${invoice.totalAmount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

export default function ContractorInvoicesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<ContractorInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<ContractorInvoice | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

  useEffect(() => {
    fetchInvoices(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const fetchInvoices = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      // Fetch from the contractor dashboard invoices endpoint which includes manual invoices
      const response = await invoicesApi.getMyAllInvoices({ page, limit })
      
      setInvoices(response.data.invoices || [])
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 1 })
    } catch (error) {
      handleApiError(error, 'Failed to load invoices')
      console.error("Failed to load invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (invoiceId: string, invoiceType: string) => {
    try {
      // Different download endpoint for manual invoices
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'
      const endpoint = invoiceType === 'manual' 
        ? `${baseUrl}/invoices/manual/${invoiceId}/download`
        : `${baseUrl}/invoices/${invoiceId}/download`
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your invoice has been paid successfully.",
    })
    setShowPaymentDialog(false)
    setSelectedInvoice(null)
    fetchInvoices(pagination.page, pagination.limit)
  }

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    invoice.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const getStatusBadge = (invoice: ContractorInvoice) => {
    if (invoice.paidAt || invoice.status === 'PAID') {
      return <Badge className="bg-green-500">Paid</Badge>
    } else if (invoice.status === 'OVERDUE' || (invoice.dueDate && new Date(invoice.dueDate) < new Date())) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (invoice.status === 'CANCELED' || invoice.status === 'CANCELLED') {
      return <Badge variant="secondary">Cancelled</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'manual':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Admin Invoice</Badge>
      case 'commission':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Commission</Badge>
      default:
        return <Badge variant="outline">Regular</Badge>
    }
  }

  const canPayInvoice = (invoice: ContractorInvoice) => {
    // Use isPayable flag from backend if available, otherwise check manually
    if (invoice.isPayable !== undefined) {
      return invoice.isPayable
    }
    // Fallback to manual check
    return invoice.type === 'manual' && 
           !invoice.paidAt && 
           invoice.status !== 'PAID' && 
           invoice.status !== 'CANCELED' && 
           invoice.status !== 'CANCELLED'
  }

  return (
    <div className="container px-4 py-6 md:py-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
          <p className="text-muted-foreground">
            View and manage all your invoices including admin-issued invoices
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            Your complete invoice history including commission and admin invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{getTypeBadge(invoice.type)}</TableCell>
                      <TableCell>{formatDate(invoice.issuedAt || invoice.createdAt)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{invoice.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {canPayInvoice(invoice) && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedInvoice(invoice)
                              setShowPaymentDialog(true)
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleDownload(invoice.id, invoice.type)}>
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No results match your search criteria" : "You don't have any invoices yet"}
              </p>
            </div>
          )}
        </CardContent>
        {!loading && filteredInvoices.length > 0 && pagination.pages > 1 && (
          <CardFooter>
            <Pagination className="w-full">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => pagination.page > 1 && setPagination({...pagination, page: pagination.page - 1})}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(pagination.pages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={pagination.page === i + 1}
                      onClick={() => setPagination({...pagination, page: i + 1})}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => pagination.page < pagination.pages && setPagination({...pagination, page: pagination.page + 1})}
                    className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* Payment Dialog for Manual Invoices */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription>
              Complete payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Invoice:</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Description:</span>
                  <span className="font-medium">{selectedInvoice.description}</span>
                </div>
                {selectedInvoice.dueDate && (
                  <div className="flex justify-between text-sm">
                    <span>Due Date:</span>
                    <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                )}
              </div>

              <ManualInvoicePaymentForm
                invoice={selectedInvoice}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentDialog(false)
                  setSelectedInvoice(null)
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
