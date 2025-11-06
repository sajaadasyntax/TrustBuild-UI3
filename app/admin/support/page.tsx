"use client"

import { useState, useEffect } from "react"
import { Users, MessageSquare, Clock, CheckCircle, AlertTriangle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { adminApi } from "@/lib/adminApi"
import { useToast } from "@/hooks/use-toast"

interface SupportTicket {
  id: string
  ticketNumber: string
  customerName: string
  email: string
  subject: string
  category: string
  priority: string
  status: string
  assignee?: string
  createdAt: string
  lastResponse?: string
  description: string
}

export default function CustomerSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    openTickets: 0,
    inProgressTickets: 0,
    resolvedToday: 12,
    averageResponseTime: "2.5 hours",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
    fetchStats()
  }, [statusFilter, priorityFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter !== "all") params.status = statusFilter.toUpperCase()
      if (priorityFilter !== "all") params.priority = priorityFilter.toUpperCase()
      if (searchQuery) params.search = searchQuery

      const response = await adminApi.getSupportTickets(params)
      setTickets(response.data.tickets || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSupportTicketStats()
      if (response.data?.stats) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const handleSearch = () => {
    fetchTickets()
  }

  const handleResolve = async (ticketId: string) => {
    try {
      await adminApi.updateSupportTicketStatus(ticketId, "RESOLVED")
      toast({
        title: "Success",
        description: "Ticket marked as resolved",
      })
      fetchTickets()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve ticket",
        variant: "destructive",
      })
    }
  }

  const handleAssign = async (ticketId: string) => {
    try {
      await adminApi.assignSupportTicket(ticketId)
      toast({
        title: "Success",
        description: "Ticket assigned to you",
      })
      fetchTickets()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case "open":
        return <Badge variant="destructive">Open</Badge>
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "resolved":
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority = priority.toLowerCase()
    switch (normalizedPriority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "high":
        return <Badge variant="default" className="bg-orange-500">High</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Customer Support Center</h1>
        </div>
        <p className="text-muted-foreground">
          Manage customer inquiries, complaints, and support requests
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.openTickets}
            </div>
            <p className="text-sm text-muted-foreground">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.inProgressTickets}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolvedToday}
            </div>
            <p className="text-sm text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.averageResponseTime}
            </div>
            <p className="text-sm text-muted-foreground">Avg Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket.id} className={ticket.priority.toLowerCase() === "urgent" ? "border-red-200" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://avatar.vercel.sh/${ticket.customerName}`} />
                      <AvatarFallback>{ticket.customerName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        #{ticket.ticketNumber} - {ticket.subject}
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </CardTitle>
                      <CardDescription>
                        {ticket.customerName} • {ticket.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    {ticket.status.toLowerCase() === "open" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAssign(ticket.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Assign to Me
                      </Button>
                    )}
                    {ticket.status.toLowerCase() !== "resolved" && (
                      <Button 
                        size="sm"
                        onClick={() => handleResolve(ticket.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground capitalize">{ticket.category.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assigned to</p>
                    <p className="text-sm text-muted-foreground">{ticket.assignee || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                </div>

                {ticket.lastResponse && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last response: {formatDate(ticket.lastResponse)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tickets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 