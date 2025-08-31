"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Download, FileText, Search } from "lucide-react"
import { invoicesApi, handleApiError, Invoice } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContractorInvoicesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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
      const response = await invoicesApi.getMyInvoices({ page, limit })
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
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      const blob = await invoicesApi.downloadInvoice(invoiceId)
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

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
          <p className="text-muted-foreground">
            View and manage all your invoices
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
            Your complete invoice history
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
                      <TableCell>
                        <Link href={`/dashboard/contractor/invoices/${invoice.id}`} className="font-medium hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{invoice.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/dashboard/contractor/invoices/${invoice.id}`} passHref>
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
    </div>
  )
}
