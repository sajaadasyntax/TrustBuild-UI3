"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Download, 
  ArrowLeft, 
  Printer, 
  Send, 
  Clock, 
  CheckCircle,
  XCircle, 
  AlertTriangle,
  ArrowDownRight,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { adminApi } from '@/lib/adminApi'
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoiceNumber: string
  contractorId: string
  jobId: string
  amount: number
  vatRate?: number
  vatAmount?: number
  totalAmount: number
  status: string
  description: string
  issuedAt: string
  dueAt: string
  paidAt?: string
  createdAt: string
  recipientName: string
  recipientEmail: string
  recipientAddress?: string
  contractor: {
    businessName: string
    email: string
    phone: string
  }
  job: {
    title: string
    description: string
  }
  payments?: Array<{
    id: string
    type: string
    stripePaymentId?: string
  }>
  lineItems?: Array<{
    description: string
    amount: number
  }>
}

// Moved handleApiError inside component to use toast
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export default function AdminInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { admin } = useAdminAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Refund state
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [isFullRefund, setIsFullRefund] = useState(true)
  const [processingRefund, setProcessingRefund] = useState(false)

  const fetchInvoiceDetails = useCallback(async (invoiceId: string) => {
    try {
      setLoading(true)
      const response = await adminApi.getInvoiceById(invoiceId)
      setInvoice(response.data?.invoice || response.invoice || response)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoice details. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load invoice details:", error)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!admin) return
    
    const invoiceId = params.id as string
    fetchInvoiceDetails(invoiceId)
  }, [params.id, admin, fetchInvoiceDetails])

  const handleDownload = () => {
    if (!invoice) return
    
    try {
      adminApi.downloadInvoice(invoice.id)
      toast({
        title: "Success",
        description: "Invoice download started",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = async () => {
    if (!invoice) return
    
    try {
      setIsSendingEmail(true)
      await adminApi.sendInvoiceEmail(invoice.id)
      toast({
        title: "Success",
        description: "Invoice email sent successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!invoice) return
    
    try {
      setIsUpdatingStatus(true)
      await adminApi.updateInvoiceStatus(invoice.id, status)
      toast({
        title: "Success",
        description: `Invoice status updated to ${status}.`,
      })
      // Refresh invoice data
      fetchInvoiceDetails(invoice.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Get the linked payment ID (if the invoice has an associated payment)
  const linkedPaymentId = invoice?.payments?.[0]?.id
  const linkedPaymentStripeId = invoice?.payments?.[0]?.stripePaymentId
  const canRefund = invoice?.paidAt && linkedPaymentId && linkedPaymentStripeId

  const handleOpenRefund = () => {
    setRefundReason('')
    setRefundAmount('')
    setIsFullRefund(true)
    setShowRefundDialog(true)
  }

  const handleProcessRefund = async () => {
    if (!linkedPaymentId) return
    if (!refundReason.trim()) {
      toast({ title: 'Validation Error', description: 'Please provide a reason for the refund.', variant: 'destructive' })
      return
    }

    const invoiceAmount = Number(invoice?.totalAmount || 0)
    if (!isFullRefund && (!refundAmount || Number(refundAmount) <= 0)) {
      toast({ title: 'Validation Error', description: 'Please enter a valid partial refund amount.', variant: 'destructive' })
      return
    }
    if (!isFullRefund && Number(refundAmount) > invoiceAmount) {
      toast({ title: 'Validation Error', description: 'Partial refund amount cannot exceed the invoice total.', variant: 'destructive' })
      return
    }

    try {
      setProcessingRefund(true)
      const payload: { reason: string; amount?: number } = { reason: refundReason.trim() }
      if (!isFullRefund) {
        payload.amount = Number(refundAmount)
      }

      const result = await adminApi.refundPayment(linkedPaymentId, payload)

      toast({
        title: 'Refund Processed',
        description: result.message || 'Refund was successful.',
      })
      setShowRefundDialog(false)
      // Refresh invoice data
      fetchInvoiceDetails(invoice!.id)
    } catch (error: any) {
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setProcessingRefund(false)
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A'
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

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.paidAt) {
      return <Badge className="bg-green-500">Paid</Badge>
    } else if (invoice.dueAt && new Date(invoice.dueAt) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'LEAD_ACCESS':
        return <Badge variant="secondary">Lead Access</Badge>
      case 'SUBSCRIPTION':
        return <Badge variant="secondary">Subscription</Badge>
      case 'JOB_PAYMENT':
        return <Badge variant="secondary">Job Payment</Badge>
      case 'COMMISSION':
        return <Badge variant="secondary">Commission</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
            <p className="text-muted-foreground">
              {invoice ? `Invoice #${invoice.invoiceNumber}` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleSendEmail} disabled={isSendingEmail}>
            <Send className="h-4 w-4 mr-2" />
            {isSendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {canRefund && (
            <Button variant="destructive" onClick={handleOpenRefund}>
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Refund
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : invoice ? (
        <div className="space-y-6" id="printable-invoice">
          <Card className="print:shadow-none print:border-none">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
                  <CardDescription>
                    Issued on {formatDate(invoice.issuedAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice)}
                    {invoice.payments && invoice.payments[0] && getPaymentTypeBadge(invoice.payments[0].type)}
                  </div>
                  <div className="print:hidden">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isUpdatingStatus}>
                          <Clock className="h-4 w-4 mr-2" />
                          Change Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Invoice Status</DialogTitle>
                          <DialogDescription>
                            Change the status of invoice #{invoice.invoiceNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                          <Button 
                            variant="outline" 
                            onClick={() => handleUpdateStatus('PENDING')}
                            className="justify-start"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Pending
                          </Button>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 justify-start" 
                            onClick={() => handleUpdateStatus('PAID')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Paid
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleUpdateStatus('OVERDUE')}
                            className="justify-start"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Mark as Overdue
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleUpdateStatus('CANCELLED')}
                            className="justify-start"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Invoice
                          </Button>
                        </div>
                        <DialogFooter>
                          <DialogTrigger asChild>
                            <Button variant="outline">Close</Button>
                          </DialogTrigger>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">From</h3>
                  <p className="font-semibold">TRUSTBUILDERS LTD</p>
                  <p>124 City Road</p>
                  <p>London, EC1V 2NX</p>
                  <p>United Kingdom</p>
                  <p className="text-sm text-muted-foreground mt-2">Company No: 16452861</p>
                  <p className="text-sm text-muted-foreground">VAT No: 496 3800 58</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">To</h3>
                  <p>{invoice.recipientName}</p>
                  <p>{invoice.recipientEmail}</p>
                  {invoice.recipientAddress && <p>{invoice.recipientAddress}</p>}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Invoice Details</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(invoice.amount))}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>VAT ({invoice.vatRate || 20}%)</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(invoice.vatAmount || 0))}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Total (inc. VAT)</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span>{invoice.paidAt ? 'Paid' : invoice.dueAt && new Date(invoice.dueAt) < new Date() ? 'Overdue' : 'Pending'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{formatDate(invoice.issuedAt)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{formatDate(invoice.dueAt)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span>{formatDate(invoice.paidAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Related Information</h3>
                  <div className="space-y-1 text-sm">
                    {invoice.payments && invoice.payments[0] && (
                      <>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Payment Type:</span>
                          <span>{invoice.payments[0].type}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Payment ID:</span>
                          <span>{invoice.payments[0].id}</span>
                        </div>
                        {invoice.payments[0].stripePaymentId && (
                          <div className="grid grid-cols-2">
                            <span className="text-muted-foreground">Stripe Payment:</span>
                            <span>{invoice.payments[0].stripePaymentId}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-6 space-y-2">
              <p className="text-xs text-muted-foreground">
                This invoice was automatically generated by the TrustBuild system. For any questions, please contact support.
              </p>
              <p className="text-xs text-muted-foreground">
                TRUSTBUILDERS LTD | 124 City Road, London, EC1V 2NX | Company No: 16452861 | VAT No: 496 3800 58
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
            <CardDescription>
              The requested invoice could not be found or you don&apos;t have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/admin/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Invoices
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Refund Confirmation Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Refund Invoice Payment
            </DialogTitle>
            <DialogDescription>
              This action will refund money to the customer via Stripe and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {invoice && (
            <div className="space-y-4">
              {/* Invoice summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono">#{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient</span>
                  <span>{invoice.recipientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold">{formatCurrency(Number(invoice.totalAmount))}</span>
                </div>
                {linkedPaymentStripeId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stripe ID</span>
                    <span className="font-mono text-xs">{linkedPaymentStripeId}</span>
                  </div>
                )}
              </div>

              {/* Refund type */}
              <div className="space-y-2">
                <Label>Refund Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoiceRefundType"
                      checked={isFullRefund}
                      onChange={() => { setIsFullRefund(true); setRefundAmount('') }}
                      className="accent-red-600"
                    />
                    <span className="text-sm">Full Refund ({formatCurrency(Number(invoice.totalAmount))})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoiceRefundType"
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
                  <Label htmlFor="invoice-refund-amount">Refund Amount (GBP)</Label>
                  <Input
                    id="invoice-refund-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(invoice.totalAmount)}
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {formatCurrency(Number(invoice.totalAmount))}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="invoice-refund-reason">Reason for Refund *</Label>
                <Textarea
                  id="invoice-refund-reason"
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
                      {isFullRefund ? 'full' : `partial (${formatCurrency(Number(refundAmount) || 0)})`}
                    </strong>{' '}
                    refund through Stripe. The funds will be returned to the original payment method.
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
