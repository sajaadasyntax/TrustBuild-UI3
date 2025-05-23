"use client"

import { useState } from "react"
import { Users, MessageSquare, Clock, CheckCircle, AlertTriangle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const mockTickets = [
  {
    id: "TKT001",
    customer: "John Doe",
    email: "john.doe@email.com",
    subject: "Payment Issue with Kitchen Renovation",
    category: "billing",
    priority: "high",
    status: "open",
    assignee: "Sarah Wilson",
    created: "2024-03-15 10:30",
    lastResponse: "2024-03-15 14:20",
    description: "Customer unable to process payment for completed kitchen renovation project.",
  },
  {
    id: "TKT002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    subject: "Contractor No-Show Issue",
    category: "complaint",
    priority: "urgent",
    status: "in_progress",
    assignee: "Mike Johnson",
    created: "2024-03-15 09:15",
    lastResponse: "2024-03-15 13:45",
    description: "Contractor failed to show up for scheduled bathroom remodeling appointment.",
  },
  {
    id: "TKT003",
    customer: "Bob Wilson",
    email: "bob.wilson@email.com",
    subject: "How to Update Profile Information",
    category: "general",
    priority: "low",
    status: "resolved",
    assignee: "Emily Brown",
    created: "2024-03-14 16:20",
    lastResponse: "2024-03-14 17:30",
    description: "Customer needs help updating profile information and contact details.",
  },
  {
    id: "TKT004",
    customer: "Lisa Davis",
    email: "lisa.davis@email.com",
    subject: "Refund Request for Cancelled Project",
    category: "billing",
    priority: "medium",
    status: "pending",
    assignee: "Tom Anderson",
    created: "2024-03-14 11:45",
    lastResponse: "2024-03-15 09:20",
    description: "Customer requesting refund for cancelled home extension project.",
  },
]

export default function CustomerSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [tickets, setTickets] = useState(mockTickets)

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleResolve = (ticketId: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: "resolved" }
          : ticket
      )
    )
  }

  const handleAssign = (ticketId: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: "in_progress", assignee: "Current User" }
          : ticket
      )
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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
    switch (priority) {
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

  const supportStats = {
    openTickets: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolvedToday: 12,
    averageResponseTime: "2.5 hours",
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
              {supportStats.openTickets}
            </div>
            <p className="text-sm text-muted-foreground">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {supportStats.inProgress}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {supportStats.resolvedToday}
            </div>
            <p className="text-sm text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {supportStats.averageResponseTime}
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
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className={ticket.priority === "urgent" ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${ticket.customer}`} />
                    <AvatarFallback>{ticket.customer.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      #{ticket.id} - {ticket.subject}
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </CardTitle>
                    <CardDescription>
                      {ticket.customer} • {ticket.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  {ticket.status === "open" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssign(ticket.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Assign to Me
                    </Button>
                  )}
                  {ticket.status !== "resolved" && (
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
                  <p className="text-sm text-muted-foreground capitalize">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Assigned to</p>
                  <p className="text-sm text-muted-foreground">{ticket.assignee}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{ticket.created}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last response: {ticket.lastResponse}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tickets found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 