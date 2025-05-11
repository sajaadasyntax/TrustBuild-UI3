"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function ClientCurrentJobs() {
  // Mock data - in a real app would come from API/database
  const activeJobs = [
    {
      id: "job1",
      title: "Kitchen Renovation",
      status: "OPEN",
      applications: 5,
      budget: "£5,000",
      postedAt: "2 days ago",
    },
    {
      id: "job2",
      title: "Bathroom Remodeling",
      status: "IN_PROGRESS",
      contractor: "Smith & Sons Builders",
      budget: "£3,500",
      startedAt: "1 week ago",
    },
  ]

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Current Jobs</h1>
          <p className="text-muted-foreground">Manage your active projects</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {activeJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any active jobs</p>
              <Button asChild className="mt-4">
                <Link href="/post-job">Post Your First Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          activeJobs.map((job) => (
            <Card key={job.id} className="dashboard-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{job.title}</CardTitle>
                  <Badge variant={job.status === "OPEN" ? "secondary" : "outline"}>
                    {job.status === "OPEN" ? "Open" : "In Progress"}
                  </Badge>
                </div>
                <CardDescription>Budget: {job.budget}</CardDescription>
              </CardHeader>
              <CardContent>
                {job.status === "OPEN" ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Posted {job.postedAt} • {job.applications} applications</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Started {job.startedAt} • Contractor: {job.contractor}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/client/jobs/${job.id}`}>
                    {job.status === "OPEN" ? "View Applications" : "View Progress"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 