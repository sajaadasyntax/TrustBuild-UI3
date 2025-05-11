"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"

export default function ContractorJobHistory() {
  // Mock data - in a real app would come from API/database
  const completedJobs = [
    {
      id: "job4",
      title: "Garden Landscaping",
      customer: "Sarah Johnson",
      budget: "£1,800",
      completedAt: "1 month ago",
      rating: 5,
    },
    {
      id: "job5",
      title: "Roofing Repair",
      customer: "Tom Parker",
      budget: "£950",
      completedAt: "2 months ago",
      rating: 4.5,
    },
    {
      id: "job6",
      title: "Bathroom Remodel",
      customer: "Emma Thompson",
      budget: "£3,200",
      completedAt: "3 months ago",
      rating: 5,
    },
  ]

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job History</h1>
          <p className="text-muted-foreground">View your completed projects</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {completedJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any completed jobs yet</p>
            </CardContent>
          </Card>
        ) : (
          completedJobs.map((job) => (
            <Card key={job.id} className="dashboard-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{job.title}</CardTitle>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                    <span>{job.rating}</span>
                  </div>
                </div>
                <CardDescription>
                  Budget: {job.budget} • Customer: {job.customer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Completed {job.completedAt}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/jobs/${job.id}`}>
                    View Details
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