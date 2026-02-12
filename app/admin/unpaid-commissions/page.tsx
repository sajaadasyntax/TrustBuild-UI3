"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, AlertTriangle, RefreshCw, Search, Calendar, User, FileText, CheckCircle, Shield, AlertCircle, Send, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

  // Manual override state
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideCommission, setOverrideCommission] = useState<UnpaidCommission | null>(null)
  const [overrideReason, setOverrideReason] = useState("")
  const [overrideNotes, setOverrideNotes] = useState("")
  const [processingOverride, setProcessingOverride] = useState(false)

  // Send Reminder state
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [reminderCommission, setReminderCommission] = useState<UnpaidCommission | null>(null)
  const [reminderMessage, setReminderMessage] = useState("")
  const [sendingReminder, setSendingReminder] = useState(false)

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

  const openOverrideDialog = (commission: UnpaidCommission) => {
    setOverrideCommission(commission)
    setOverrideReason("")
    setOverrideNotes("")
    setShowOverrideDialog(true)
  }

  const handleManualOverride = async () => {
    if (!overrideCommission) return
    if (!overrideReason.trim()) {
      toast({ title: "Validation Error", description: "Please provide a reason for the manual override.", variant: "destructive" })
      return
    }

    try {
      setProcessingOverride(true)
      const result = await adminApi.manualOverrideCommission(overrideCommission.id, {
        reason: overrideReason.trim(),
        notes: overrideNotes.trim() || undefined,
      })

      toast({
        title: "Commission Marked as Paid",
        description: result.message || `Commission for ${overrideCommission.contractor.businessName} has been manually marked as paid.`,
      })
      setShowOverrideDialog(false)
      fetchUnpaidCommissions() // Refresh the list
    } catch (error: any) {
      console.error("Manual override error:", error)
      toast({
        title: "Override Failed",
        description: error.message || "Failed to process manual override. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingOverride(false)
    }
  }

  const openReminderDialog = (commission: UnpaidCommission) => {
    setReminderCommission(commission)
    setReminderMessage("")
    setShowReminderDialog(true)
  }

  const handleSendReminder = async () => {
    if (!reminderCommission) return

    try {
      setSendingReminder(true)
      await adminApi.sendCommissionReminder(
        reminderCommission.id,
        reminderMessage.trim() || undefined
      )

      toast({
        title: "Reminder Sent",
        description: `Email and in-app notification sent to ${reminderCommission.contractor.businessName} (${reminderCommission.contractor.user.email}).`,
      })
      setShowReminderDialog(false)
      setReminderCommission(null)
      setReminderMessage("")
      // Refresh the list so remindersSent count updates
      fetchUnpaidCommissions()
    } catch (error: any) {
      console.error("Send reminder error:", error)
      toast({
        title: "Reminder Failed",
        description: error.message || "Failed to send reminder. Check the email service and recipient address.",
        variant: "destructive",
      })
    } finally {
      setSendingReminder(false)
    }
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReminderDialog(comm)}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Send Reminder
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openOverrideDialog(comm)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark as Paid
                            </Button>
                          </div>
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

      {/* Send Reminder Confirmation Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Send Commission Reminder
            </DialogTitle>
            <DialogDescription>
              This will send an <strong>email</strong> and an <strong>in-app notification</strong> to the contractor about their outstanding commission payment.
            </DialogDescription>
          </DialogHeader>

          {reminderCommission && (
            <div className="space-y-4">
              {/* Commission summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contractor</span>
                  <span className="font-medium">{reminderCommission.contractor.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient Email</span>
                  <span className="font-mono text-xs">{reminderCommission.contractor.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Job</span>
                  <span className="max-w-[250px] truncate">{reminderCommission.job.title}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                  <span>Total Due</span>
                  <span className="text-destructive">{formatCurrency(reminderCommission.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className={new Date(reminderCommission.dueDate) < new Date() ? 'text-destructive font-medium' : ''}>
                    {formatDate(reminderCommission.dueDate)}
                  </span>
                </div>
              </div>

              {/* Optional custom message */}
              <div className="space-y-2">
                <Label htmlFor="reminder-message">Custom Message (optional)</Label>
                <Textarea
                  id="reminder-message"
                  placeholder="Add a personal message to include in the reminder email, e.g. 'Please contact us if you are having payment difficulties...'"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This message will appear in a highlighted section of the email. Leave blank to send the standard reminder.
                </p>
              </div>

              {/* Info about what gets sent */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    The contractor will receive an <strong>email</strong> at <strong>{reminderCommission.contractor.user.email}</strong> with
                    invoice details and payment instructions, plus an <strong>in-app notification</strong> visible on their dashboard.
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReminderDialog(false)}
                  disabled={sendingReminder}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendReminder}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reminder
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Override Confirmation Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Manual Override — Mark Commission as Paid
            </DialogTitle>
            <DialogDescription>
              This will mark the commission as paid <strong>without</strong> a Stripe payment. This action will be recorded in the audit log.
            </DialogDescription>
          </DialogHeader>

          {overrideCommission && (
            <div className="space-y-4">
              {/* Commission summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contractor</span>
                  <span className="font-medium">{overrideCommission.contractor.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contact</span>
                  <span>{overrideCommission.contractor.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Job</span>
                  <span className="max-w-[250px] truncate">{overrideCommission.job.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commission Amount</span>
                  <span>{formatCurrency(overrideCommission.commissionAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span>{formatCurrency(overrideCommission.vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                  <span>Total Due</span>
                  <span>{formatCurrency(overrideCommission.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className={new Date(overrideCommission.dueDate) < new Date() ? 'text-destructive font-medium' : ''}>
                    {formatDate(overrideCommission.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Status</span>
                  <span>{getStatusBadge(overrideCommission.status, overrideCommission.dueDate)}</span>
                </div>
              </div>

              {/* Reason (required) */}
              <div className="space-y-2">
                <Label htmlFor="override-reason">Reason for Manual Override *</Label>
                <Textarea
                  id="override-reason"
                  placeholder="e.g. Payment received via bank transfer, offline payment confirmed, goodwill write-off..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Notes (optional) */}
              <div className="space-y-2">
                <Label htmlFor="override-notes">Additional Notes (optional)</Label>
                <Textarea
                  id="override-notes"
                  placeholder="Any additional context or reference numbers..."
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    This action bypasses the standard Stripe payment flow. The commission will be marked as <strong>Paid</strong>, 
                    the related job will be updated, and a transaction record will be created in the ledger. 
                    Your name and this action will be recorded in the admin activity log.
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowOverrideDialog(false)}
                  disabled={processingOverride}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleManualOverride}
                  disabled={processingOverride || !overrideReason.trim()}
                >
                  {processingOverride ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm — Mark as Paid
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

