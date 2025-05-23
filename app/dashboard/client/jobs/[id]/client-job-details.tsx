"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Calendar, Building2, MessageSquare, Star, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface Job {
  id: string
  title: string
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED"
  description: string
  location: string
  postedAt: string
  startedAt?: string
  completedAt?: string
  contractor?: {
    name: string
    rating: number
    completedJobs: number
    joinedAt: string
  }
  progress?: number
  timeline: string
  applications?: Array<{
    id: string
    contractor: string
    rating: number
    completedJobs: number
    message: string
    submittedAt: string
  }>
}

export function ClientJobDetails({ job }: { job: Job }) {
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirmJob = (contractorId: string) => {
    setSelectedContractor(contractorId)
    setIsConfirming(true)
  }

  const handleConfirm = () => {
    // In a real app, this would make an API call to confirm the job
    console.log("Job confirmed with contractor:", selectedContractor)
    // Redirect to current jobs page after confirmation
    window.location.href = "/dashboard/client/current-jobs"
  }

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">Job Details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client/current-jobs">
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
                <Badge variant={
                  job.status === "OPEN" ? "secondary" :
                  job.status === "COMPLETED" ? "default" :
                  "outline"
                }>
                  {job.status === "OPEN" ? "Open" :
                   job.status === "COMPLETED" ? "Completed" :
                   "In Progress"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Posted on {job.postedAt}</span>
                {job.startedAt && <span className="ml-4">Started on {job.startedAt}</span>}
                {job.completedAt && <span className="ml-4">Completed on {job.completedAt}</span>}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Timeline: {job.timeline}</span>
              </div>
              <p className="text-sm">{job.description}</p>
            </CardContent>
          </Card>

          {job.status === "IN_PROGRESS" && job.progress && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {job.status === "OPEN" && job.applications && (
            <Card>
              <CardHeader>
                <CardTitle>Applications ({job.applications.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{application.contractor}</CardTitle>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                          <span>{application.rating}</span>
                        </div>
                      </div>
                      <CardDescription>
                        {application.completedJobs} jobs completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{application.message}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/contractors">Join as a Contractor</Link>
                      </Button>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleConfirmJob(application.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {job.status === "IN_PROGRESS" && job.contractor && (
            <Card>
              <CardHeader>
                <CardTitle>Contractor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{job.contractor.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent mr-1" />
                    <span>{job.contractor.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.contractor.completedJobs} jobs completed
                </p>
                <p className="text-sm text-muted-foreground">
                  Member since {job.contractor.joinedAt}
                </p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Contractor
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Job Assignment</CardTitle>
              <CardDescription>
                Are you sure you want to assign this job to the selected contractor?
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsConfirming(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleConfirm}>
                Confirm Assignment
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
} 