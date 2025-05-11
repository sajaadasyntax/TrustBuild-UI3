"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Star, Building2, MessageSquare } from "lucide-react"

// Mock data - in a real app would come from API/database
const activeJobs = [
  {
    id: "job1",
    title: "Kitchen Renovation",
    status: "OPEN",
    applications: 3,
    budget: "£5,000",
    postedAt: "2024-03-15",
  },
  {
    id: "job2",
    title: "Bathroom Remodeling",
    status: "IN_PROGRESS",
    contractor: "Modern Interiors Ltd",
    budget: "£3,500",
    startedAt: "2024-03-10",
    progress: 45,
  },
]

const completedJobs = [
  {
    id: "job3",
    title: "Living Room Painting",
    contractor: "Modern Interiors Ltd",
    budget: "£1,200",
    completedAt: "2024-03-01",
    rating: 4.8,
  },
  {
    id: "job4",
    title: "Garden Landscaping",
    contractor: "Green Thumb Landscaping",
    budget: "£2,500",
    completedAt: "2024-02-15",
    rating: 4.5,
  },
]

export default function ClientDashboard() {
  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your jobs</p>
        </div>
        <Button asChild>
          <Link href="/post-job">Post New Job</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>Your ongoing and open jobs</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/client/current-jobs">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active jobs</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          <CardDescription>Budget: {job.budget}</CardDescription>
                        </div>
                        <Badge variant={job.status === "OPEN" ? "secondary" : "outline"}>
                          {job.status === "OPEN" ? "Open" : "In Progress"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.status === "OPEN" ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Posted on {job.postedAt}</span>
                          <span className="mx-2">•</span>
                          <span>{job.applications} applications</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>{job.contractor}</span>
                            </div>
                            <span>Progress: {job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/client/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Jobs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Recent Completed Jobs</CardTitle>
                <CardDescription>Your recently finished projects</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/client/job-history">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {completedJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No completed jobs</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{job.title}</CardTitle>
                          <CardDescription>Budget: {job.budget}</CardDescription>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.contractor}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                          <span>{job.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/client/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}