"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

export default function ContractorCurrentJobs() {
  // Mock data - in a real app would come from API/database
  const activeJobs = [
    {
      id: "job2",
      title: "Living Room Redesign",
      customer: "Mark Wilson",
      budget: "£2,500",
      startedAt: "2 weeks ago",
      progress: 65,
    },
    {
      id: "job3",
      title: "Kitchen Renovation",
      customer: "Sarah Johnson",
      budget: "£4,800",
      startedAt: "1 week ago",
      progress: 30,
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
          <Link href="/dashboard/contractor">
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
            </CardContent>
          </Card>
        ) : (
          activeJobs.map((job) => (
            <Card key={job.id} className="dashboard-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{job.title}</CardTitle>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                <CardDescription>
                  Budget: {job.budget} • Customer: {job.customer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Started {job.startedAt}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/dashboard/contractor/jobs/${job.id}`}>
                    Update Progress
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