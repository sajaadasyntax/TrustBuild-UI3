"use client"

import { useState, useEffect } from 'react'
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
import { Download, ArrowLeft, Printer } from "lucide-react"
import { invoicesApi, handleApiError, Invoice } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const invoiceId = params.id as string
    fetchInvoiceDetails(invoiceId)
  }, [params.id])

  const fetchInvoiceDetails = async (invoiceId: string) => {
    try {
      setLoading(true)
      const data = await invoicesApi.getInvoiceById(invoiceId)
      setInvoice(data)
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
  }

  const handleDownload = async () => {
    if (!invoice) return
    
    try {
      const blob = await invoicesApi.downloadInvoice(invoice.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
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

  const handlePrint = () => {
    window.print()
  }

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

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.paidAt) {
      return <Badge className="bg-green-500">Paid</Badge>
    } else if (invoice.dueAt && new Date(invoice.dueAt) < new Date()) {
      return <Badge variant="destructive">Overdue</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} className="print:hidden">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
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
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
                  <CardDescription>
                    Issued on {formatDate(invoice.issuedAt)}
                  </CardDescription>
                </div>
                <div>
                  {getStatusBadge(invoice)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">From</h3>
                  <p>TrustBuild</p>
                  <p>123 Construction Avenue</p>
                  <p>London, UK</p>
                  <p>info@trustbuild.uk</p>
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
                        <TableCell>VAT ({Number(invoice.vatRate)}%)</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(invoice.vatAmount))}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Payment Information</h3>
                <p className="text-muted-foreground text-sm">
                  This invoice was generated automatically and is related to your purchase of access to job leads or other services on TrustBuild.
                  {invoice.paidAt 
                    ? ` This invoice was paid on ${formatDate(invoice.paidAt)}.` 
                    : invoice.dueAt 
                      ? ` Payment is due by ${formatDate(invoice.dueAt)}.`
                      : ''}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <p className="text-xs text-muted-foreground">
                For any questions regarding this invoice, please contact our support team at support@trustbuild.uk
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
            <CardDescription>
              The requested invoice could not be found or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/dashboard/contractor/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Invoices
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
