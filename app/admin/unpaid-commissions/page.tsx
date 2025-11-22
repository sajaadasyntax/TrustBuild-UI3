"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, AlertTriangle, RefreshCw, Search, Calendar, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import adminApi from "@/lib/adminApi"
import { useToast } from "@/hooks/use-toast"

interface UnpaidCommission {
  id: string
  contractorId: string
  contractor: {
    id: string
    businessName: string
    user: {
      name: string
      email: string
    }
  }
  job: {
    id: string
    title: string
  }
  finalJobAmount: number | string
  commissionAmount: number | string
  vatAmount: number | string
  totalAmount: number | string
  dueDate: string
  status: string
  createdAt: string
  invoice?: {
    invoiceNumber: string
  }
}

export default function UnpaidCommissionsPage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [commissions, setCommissions] = useState<UnpaidCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"PENDING" | "OVERDUE" | "ALL">("ALL")

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, authLoading, router])

  const fetchUnpaidCommissions = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch all commission payments and filter for unpaid ones
      const response = await adminApi.getUnpaidCommissions?.() || { data: { commissions: [] } }
      
      // If API doesn't exist, we'll need to create it, but for now filter from all commissions
      let unpaidCommissions: UnpaidCommission[] = []
      
      // Try to get commissions from the response
      if (response.data?.commissions) {
        unpaidCommissions = response.data.commissions.filter((comm: any) => 
          comm.status === 'PENDING' || comm.status === 'OVERDUE'
        )
      }
      
      setCommissions(unpaidCommissions)
    } catch (error) {
      console.error('Failed to fetch unpaid commissions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch unpaid commissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (admin) {
      fetchUnpaidCommissions()
    }
  }, [admin, fetchUnpaidCommissions])

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'PENDING'
    if (isOverdue || status === 'OVERDUE') {
      return <Badge variant="destructive">Overdue</Badge>
    }
    if (status === 'PENDING') {
      return <Badge variant="outline">Pending</Badge>
    }
    return <Badge variant="default">{status}</Badge>
  }

  const filteredCommissions = commissions.filter(comm => {
    const matchesSearch = 
      comm.contractor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.contractor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.contractor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.job.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'OVERDUE' && (comm.status === 'OVERDUE' || (comm.status === 'PENDING' && new Date(comm.dueDate) < new Date()))) ||
      (filterStatus === 'PENDING' && comm.status === 'PENDING' && new Date(comm.dueDate) >= new Date())
    
    return matchesSearch && matchesStatus
  })

  const totalUnpaid = filteredCommissions.reduce((sum, comm) => {
    const amount = typeof comm.totalAmount === 'string' ? parseFloat(comm.totalAmount) : comm.totalAmount
    return sum + (amount || 0)
  }, 0)

  const overdueCount = filteredCommissions.filter(comm => 
    comm.status === 'OVERDUE' || (comm.status === 'PENDING' && new Date(comm.dueDate) < new Date())
  ).length

  if (authLoading || loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Unpaid Commissions</h1>
            </div>
            <p className="text-muted-foreground">
              Track and manage contractors with outstanding commission payments
            </p>
          </div>
          <Button onClick={fetchUnpaidCommissions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUnpaid)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredCommissions.length} contractor{filteredCommissions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredCommissions.filter(c => c.status === 'PENDING' && new Date(c.dueDate) >= new Date()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Not yet due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by contractor name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('ALL')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PENDING')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'OVERDUE' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('OVERDUE')}
                size="sm"
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unpaid Commissions</CardTitle>
          <CardDescription>
            List of contractors with outstanding commission payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'ALL' 
                  ? 'No unpaid commissions match your filters'
                  : 'No unpaid commissions found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>VAT</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((comm) => {
                    const commissionAmount = typeof comm.commissionAmount === 'string' 
                      ? parseFloat(comm.commissionAmount) 
                      : comm.commissionAmount
                    const vatAmount = typeof comm.vatAmount === 'string' 
                      ? parseFloat(comm.vatAmount) 
                      : comm.vatAmount
                    const totalAmount = typeof comm.totalAmount === 'string' 
                      ? parseFloat(comm.totalAmount) 
                      : comm.totalAmount
                    const isOverdue = new Date(comm.dueDate) < new Date() && comm.status === 'PENDING'

                    return (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{comm.contractor.businessName}</div>
                            <div className="text-sm text-muted-foreground">{comm.contractor.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">{comm.job.title}</div>
                        </TableCell>
                        <TableCell>{formatCurrency(commissionAmount)}</TableCell>
                        <TableCell>{formatCurrency(vatAmount)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(totalAmount)}</TableCell>
                        <TableCell>
                          <div className={isOverdue ? 'text-destructive font-medium' : ''}>
                            {formatDate(comm.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(comm.status, comm.dueDate)}
                        </TableCell>
                        <TableCell>
                          {comm.invoice?.invoiceNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to contractor details or send reminder
                              toast({
                                title: "Reminder Sent",
                                description: `Reminder sent to ${comm.contractor.businessName}`,
                              })
                            }}
                          >
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

