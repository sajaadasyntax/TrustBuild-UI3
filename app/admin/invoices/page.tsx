"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Download, FileText, Search, Calendar } from "lucide-react"
import { adminApi } from '@/lib/adminApi'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoiceNumber: string
  contractorId: string
  jobId: string
  amount: number
  status: string
  dueDate: string
  paidDate?: string
  createdAt: string
  issuedAt: string
  paidAt?: string
  dueAt?: string
  totalAmount: number | string
  recipientName: string
  contractor: {
    businessName: string
  }
  job: {
    title: string
  }
  payments?: Array<{
    type: string
  }>
}

// Moved handleApiError inside component to use toast
import { Skeleton } from "@/components/ui/skeleton"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

export default function AdminInvoicesPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

  const fetchInvoices = useCallback(async () => {
    // Don't make API calls while authentication is loading
    if (authLoading) {
      return
    }
    
    if (!admin) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      
      if (status && status !== "ALL") params.status = status
      if (type && type !== "ALL") params.type = type
      if (dateRange?.from) params.startDate = dateRange.from.toISOString()
      if (dateRange?.to) params.endDate = dateRange.to.toISOString()
      if (searchTerm) params.search = searchTerm
      
      const response = await adminApi.getInvoices(params)
      setInvoices(response.data)
      setPagination(response.data.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      })
      console.error("Failed to load invoices:", error)
    } finally {
      setLoading(false)
    }
  }, [admin, authLoading, pagination.page, pagination.limit, status, type, dateRange, searchTerm, toast])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchInvoices()
  }

  const handleDownload = (invoiceId: string) => {
    try {
      adminApi.downloadInvoice(invoiceId)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices Management</h1>
          <p className="text-muted-foreground">
            View and manage all invoices in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>
            Refine your invoice search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Invoice #, description..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Payment Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="LEAD_ACCESS">Lead Access</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="JOB_PAYMENT">Job Payment</SelectItem>
                  <SelectItem value="COMMISSION">Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            
            <div className="flex items-end md:col-span-2 lg:col-span-4">
              <Button type="submit" className="ml-auto">
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            Complete invoice records
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
          ) : invoices.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/admin/invoices/${invoice.id}`} className="font-medium hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                      <TableCell>{invoice.recipientName}</TableCell>
                      <TableCell>
                        {invoice.payments && invoice.payments[0] ? 
                          getPaymentTypeBadge(invoice.payments[0].type) : 
                          <Badge variant="outline">Unknown</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/admin/invoices/${invoice.id}`} passHref>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(invoice.id)}>
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
                Try adjusting your search filters
              </p>
            </div>
          )}
        </CardContent>
        {!loading && invoices.length > 0 && pagination.pages > 1 && (
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
    </div>
  )
}
