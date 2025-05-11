"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"

// Mock data - in a real app would come from API/database
const completedJobs = [
  {
    id: "job1",
    title: "Living Room Painting",
    contractor: "Modern Interiors Ltd",
    budget: "£1,200",
    completedAt: "2024-03-01",
    rating: 4.8,
    review: "Excellent work! Very professional and completed on time.",
  },
  {
    id: "job2",
    title: "Garden Landscaping",
    contractor: "Green Thumb Landscaping",
    budget: "£2,500",
    completedAt: "2024-02-15",
    rating: 4.5,
    review: "Great job transforming our garden. Would recommend!",
  },
]

export default function ClientJobHistory() {
  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job History</h1>
          <p className="text-muted-foreground">View your completed jobs</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {completedJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No completed jobs yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {completedJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>Completed on {job.completedAt}</CardDescription>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{job.contractor}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                    <span>{job.rating}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Budget: {job.budget}</span>
                </div>
                <p className="text-sm text-muted-foreground">{job.review}</p>
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
    </div>
  )
} 