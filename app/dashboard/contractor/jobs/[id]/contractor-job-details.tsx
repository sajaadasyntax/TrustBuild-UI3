"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Calendar, Clock, User, Star, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"

interface Milestone {
  id: string
  title: string
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING"
  completedAt?: string
  dueDate?: string
}

interface Job {
  id: string
  title: string
  status: "IN_PROGRESS"
  description: string
  budget: string
  location: string
  startedAt: string
  customer: {
    name: string
    rating: number
    completedJobs: number
    joinedAt: string
  }
  progress: number
  timeline: string
  milestones: Milestone[]
}

export function ContractorJobDetails({ job }: { job: Job }) {
  const [progress, setProgress] = useState(job.progress)
  const [updateMessage, setUpdateMessage] = useState("")

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress)
    // In a real app, this would make an API call to update the progress
  }

  const handleUpdateSubmit = () => {
    // In a real app, this would make an API call to save the update
    console.log("Progress update submitted:", { progress, message: updateMessage })
    setUpdateMessage("")
  }

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">Job Details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/contractor/current-jobs">
            Back to Current Jobs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Project Details</CardTitle>
                <Badge variant="outline">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Started on {job.startedAt}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Timeline: {job.timeline}</span>
              </div>
              <p className="text-sm">{job.description}</p>
            </CardContent>
          </Card>

          {/* Progress Update Section */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Update</CardTitle>
              <CardDescription>Update the project progress and add a message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleProgressUpdate(Math.max(0, progress - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleProgressUpdate(Math.min(100, progress + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Message</label>
                <Textarea
                  placeholder="Add details about the progress update..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleUpdateSubmit} className="w-full">
                Submit Update
              </Button>
            </CardContent>
          </Card>

          {/* Milestones Section */}
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-4">
                    <div className="mt-1">
                      {milestone.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : milestone.status === "IN_PROGRESS" ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          {milestone.status === "COMPLETED" && milestone.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed on {milestone.completedAt}
                            </p>
                          )}
                          {milestone.status === "PENDING" && milestone.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              Due by {milestone.dueDate}
                            </p>
                          )}
                        </div>
                        <Badge variant={
                          milestone.status === "COMPLETED" ? "default" :
                          milestone.status === "IN_PROGRESS" ? "secondary" :
                          "outline"
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{job.budget}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{job.customer.name}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                  <span>{job.customer.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {job.customer.completedJobs} jobs completed
              </p>
              <p className="text-sm text-muted-foreground">
                Member since {job.customer.joinedAt}
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 