"use client"

import { useState } from "react"
import { Search, Filter, FileText, Eye, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data
const mockJobs = [
  {
    id: "job1",
    title: "Kitchen Renovation",
    customer: "John Doe",
    contractor: "Smith & Sons Builders",
    status: "completed",
    amount: "5000",
    startDate: "2024-03-01",
    endDate: "2024-03-15",
    location: "London, UK",
    category: "Kitchen Remodeling",
    hasDispute: false,
    rating: 4.8,
    flagged: false,
  },
  {
    id: "job2",
    title: "Bathroom Remodeling",
    customer: "Jane Smith",
    contractor: "Modern Interiors Ltd",
    status: "in_progress",
    amount: "3500",
    startDate: "2024-03-10",
    endDate: null,
    location: "Manchester, UK",
    category: "Bathroom Remodeling",
    hasDispute: false,
    rating: null,
    flagged: false,
  },
  {
    id: "job3",
    title: "Home Extension Dispute",
    customer: "Mike Johnson",
    contractor: "Elite Home Solutions",
    status: "disputed",
    amount: "8500",
    startDate: "2024-02-15",
    endDate: null,
    location: "Birmingham, UK",
    category: "Home Extensions",
    hasDispute: true,
    rating: null,
    flagged: true,
  },
  {
    id: "job4",
    title: "Electrical Wiring",
    customer: "Sarah Wilson",
    contractor: "Power Solutions Ltd",
    status: "open",
    amount: "2200",
    startDate: null,
    endDate: null,
    location: "Leeds, UK",
    category: "Electrical Work",
    hasDispute: false,
    rating: null,
    flagged: false,
  },
]

export default function JobOversightPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.contractor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>
      case "open":
        return <Badge variant="secondary">Open</Badge>
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Job Oversight</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor job quality and resolve disputes across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, customers, or contractors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Kitchen Remodeling">Kitchen Remodeling</SelectItem>
            <SelectItem value="Bathroom Remodeling">Bathroom Remodeling</SelectItem>
            <SelectItem value="Home Extensions">Home Extensions</SelectItem>
            <SelectItem value="Electrical Work">Electrical Work</SelectItem>
            <SelectItem value="General Construction">General Construction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockJobs.filter(j => j.status === "in_progress").length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockJobs.filter(j => j.status === "completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {mockJobs.filter(j => j.hasDispute).length}
            </div>
            <p className="text-sm text-muted-foreground">Disputed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockJobs.filter(j => j.flagged).length}
            </div>
            <p className="text-sm text-muted-foreground">Flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className={job.flagged ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {job.title}
                    {getStatusBadge(job.status)}
                    {job.flagged && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    {job.category} • {job.location}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {job.hasDispute && (
                    <Button variant="destructive" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Resolve Dispute
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">{job.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contractor</p>
                  <p className="text-sm text-muted-foreground">{job.contractor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm text-muted-foreground">£{job.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-muted-foreground">
                    {job.startDate ? `Started: ${job.startDate}` : "Not started"}
                    {job.endDate && ` • Ended: ${job.endDate}`}
                  </p>
                </div>
              </div>
              
              {job.rating && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Customer Rating</p>
                  <p className="text-sm text-muted-foreground">⭐ {job.rating}</p>
                </div>
              )}

              {job.hasDispute && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Dispute Active</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Customer has reported issues with work quality. Investigation required.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 