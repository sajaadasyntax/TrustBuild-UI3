"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, PoundSterling, Clock, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data - in a real app would come from API/database
const mockJobs = [
  {
    id: "job1",
    title: "Kitchen Renovation",
    description: "Complete kitchen renovation including new cabinets, countertops, appliances, and flooring. The space is approximately 200 square feet.",
    budget: "£5,000",
    location: "London, UK",
    postedAt: "2024-03-15",
    category: "Kitchen Remodeling",
    timeline: "4-6 weeks",
  },
  {
    id: "job2",
    title: "Bathroom Remodeling",
    description: "Complete bathroom renovation including new fixtures, tiles, and plumbing. The space is approximately 100 square feet.",
    budget: "£3,500",
    location: "Manchester, UK",
    postedAt: "2024-03-14",
    category: "Bathroom Remodeling",
    timeline: "2-3 weeks",
  },
  {
    id: "job3",
    title: "Home Office Conversion",
    description: "Convert garage space into a home office. Includes insulation, electrical work, flooring, and built-in shelving.",
    budget: "£3,800",
    location: "Birmingham, UK",
    postedAt: "2024-03-13",
    category: "General Construction",
    timeline: "3-4 weeks",
  },
]

const categories = [
  "All Categories",
  "Kitchen Remodeling",
  "Bathroom Remodeling",
  "General Construction",
  "Electrical Work",
  "Plumbing",
  "Painting",
  "Flooring",
]

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || job.category === selectedCategory
    const matchesLocation = selectedLocation === "All Locations" || job.location === selectedLocation
    return matchesSearch && matchesCategory && matchesLocation
  })

  return (
    <div className="container py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl font-bold">Find Jobs</h1>
          <p className="text-muted-foreground">Browse available jobs and find your next project</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Locations">All Locations</SelectItem>
              <SelectItem value="London, UK">London, UK</SelectItem>
              <SelectItem value="Manchester, UK">Manchester, UK</SelectItem>
              <SelectItem value="Birmingham, UK">Birmingham, UK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <Badge>{job.category}</Badge>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <PoundSterling className="h-4 w-4" />
                      <span className="font-medium">{job.budget}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.timeline}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/jobs/${job.id}`}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 