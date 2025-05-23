"use client"

import { useState } from "react"
import { Search, Filter, Shield, CheckCircle, X, Eye, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const mockContractors = [
  {
    id: "1",
    name: "Elite Home Solutions",
    email: "contact@elitehome.com",
    phone: "+44 20 1234 5678",
    status: "pending",
    rating: 0,
    completedJobs: 0,
    yearsInBusiness: 5,
    services: ["Kitchen Renovation", "Bathroom Remodeling"],
    appliedAt: "2024-03-15",
    documents: ["Business License", "Insurance Certificate"],
  },
  {
    id: "2",
    name: "Smith & Sons Builders",
    email: "info@smithsons.co.uk",
    phone: "+44 20 9876 5432",
    status: "verified",
    rating: 4.8,
    completedJobs: 45,
    yearsInBusiness: 12,
    services: ["General Construction", "Home Extensions"],
    appliedAt: "2024-01-20",
    documents: ["Business License", "Insurance Certificate", "Trade Certification"],
  },
  {
    id: "3",
    name: "Modern Interiors Ltd",
    email: "hello@moderninteriors.com",
    phone: "+44 20 5555 1234",
    status: "verified",
    rating: 4.7,
    completedJobs: 32,
    yearsInBusiness: 8,
    services: ["Kitchen Renovation", "Complete Renovations"],
    appliedAt: "2024-02-10",
    documents: ["Business License", "Insurance Certificate"],
  },
  {
    id: "4",
    name: "Quick Fix Repairs",
    email: "support@quickfix.com",
    phone: "+44 20 7777 8888",
    status: "suspended",
    rating: 3.2,
    completedJobs: 12,
    yearsInBusiness: 3,
    services: ["General Repairs", "Maintenance"],
    appliedAt: "2024-03-01",
    documents: ["Business License"],
  },
]

export default function ContractorManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contractors, setContractors] = useState(mockContractors)

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || contractor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = (contractorId: string) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === contractorId 
          ? { ...contractor, status: "verified" }
          : contractor
      )
    )
  }

  const handleReject = (contractorId: string) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === contractorId 
          ? { ...contractor, status: "rejected" }
          : contractor
      )
    )
  }

  const handleSuspend = (contractorId: string) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === contractorId 
          ? { ...contractor, status: "suspended" }
          : contractor
      )
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-500">Verified</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "rejected":
        return <Badge variant="outline" className="text-red-500">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Contractor Management</h1>
        </div>
        <p className="text-muted-foreground">
          Verify and manage contractor profiles on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {contractors.filter(c => c.status === "verified").length}
            </div>
            <p className="text-sm text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {contractors.filter(c => c.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {contractors.filter(c => c.status === "suspended").length}
            </div>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {contractors.filter(c => c.status === "rejected").length}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Contractors List */}
      <div className="space-y-4">
        {filteredContractors.map((contractor) => (
          <Card key={contractor.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${contractor.name}`} />
                    <AvatarFallback>{contractor.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {contractor.name}
                      {getStatusBadge(contractor.status)}
                    </CardTitle>
                    <CardDescription>{contractor.email}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {contractor.status === "pending" && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(contractor.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(contractor.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {contractor.status === "verified" && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleSuspend(contractor.id)}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{contractor.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">
                    {contractor.yearsInBusiness} years • {contractor.completedJobs} jobs
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <p className="text-sm text-muted-foreground">
                    {contractor.rating > 0 ? `⭐ ${contractor.rating}` : "No ratings yet"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {contractor.services.map((service) => (
                    <Badge key={service} variant="outline">{service}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {contractor.documents.map((doc) => (
                    <Badge key={doc} variant="secondary">{doc}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContractors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No contractors found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 