"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle, ArrowRight, Bell, BriefcaseBusiness, Clock, CreditCard, FileCheck, 
  FileClock, FileText, Star, TrendingUp, Wallet 
} from "lucide-react"

export default function ContractorDashboard() {
  // Mock data - in a real app would come from API/database
  const applications = [
    {
      id: "app1",
      jobId: "job1",
      jobTitle: "Kitchen Renovation in Kensington",
      status: "PENDING",
      appliedAt: "2 days ago",
      budget: "£5,000",
      customer: "Jane Smith",
    },
    {
      id: "app2",
      jobId: "job3",
      jobTitle: "Bathroom Remodeling in Chelsea",
      status: "ACCEPTED",
      appliedAt: "1 week ago",
      budget: "£3,500",
      customer: "John Doe",
      startDate: "Next Monday",
    },
  ]

  const activeJobs = [
    {
      id: "job2",
      title: "Living Room Redesign",
      customer: "Mark Wilson",
      budget: "£2,500",
      startedAt: "2 weeks ago",
      progress: 65,
    },
  ]

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
  ]

  const subscription = {
    status: "ACTIVE",
    nextBillingDate: "April 15, 2025",
    amount: "£30",
    freeApplicationsLeft: 2,
  }

  return (
    <div className="container py-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contractor Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and find new opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/contractor/current-jobs">
              <Clock className="mr-2 h-4 w-4" />
              Current Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/contractor/job-history">
              <FileCheck className="mr-2 h-4 w-4" />
              Job History
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              Find Jobs
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-6 mb-8">
        <div className="md:w-2/3 space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Active</AlertTitle>
            <AlertDescription>
              Your monthly subscription is active. Next billing date: {subscription.nextBillingDate}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Earnings</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">£4,250</div>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
                <div className="flex items-center mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Free Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{subscription.freeApplicationsLeft}</div>
                <p className="text-sm text-muted-foreground">Remaining this week</p>
                <div className="flex items-center mt-2 text-xs">
                  <Bell className="h-3 w-3 mr-1" />
                  <span>Resets on Sunday</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Completion Rate</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">98%</div>
                <p className="text-sm text-muted-foreground">From 14 total projects</p>
                <div className="flex items-center mt-2 text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>3% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Profile</CardTitle>
              <CardDescription>
                Premier Construction Co.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">PC</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                    Premium
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-accent stroke-accent" />
                    <span className="ml-1 font-medium">4.9</span>
                    <span className="mx-1 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">48 reviews</span>
                  </div>
                  <p className="text-sm mt-1">Kitchen Remodeling Specialist</p>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Profile completion</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/profile">
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileClock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                <Button asChild>
                  <Link href="/jobs">Find Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{application.jobTitle}</CardTitle>
                    <Badge variant={application.status === "ACCEPTED" ? "default" : "secondary"}>
                      {application.status === "ACCEPTED" ? "Accepted" : "Pending"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Budget: {application.budget} • Customer: {application.customer}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Applied {application.appliedAt}</span>
                    {application.status === "ACCEPTED" && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Start date: {application.startDate}</span>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/jobs/${application.jobId}`}>
                      {application.status === "ACCEPTED" ? "View Job Details" : "View Application"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileClock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You don't have any active jobs</p>
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
                    <Link href={`/jobs/${job.id}`}>
                      Update Progress
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You don't have any completed jobs yet</p>
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
        </TabsContent>
      </Tabs>
      
      <div className="mt-12 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recommended Jobs</h2>
          <Button variant="outline" asChild>
            <Link href="/jobs">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Kitchen Extension in Camden</CardTitle>
              <CardDescription>Posted 1 day ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>Kitchen Remodeling</Badge>
              <p className="text-sm text-muted-foreground">
                Looking for a professional contractor for a kitchen extension project. Need to expand existing kitchen by 100 sq ft...
              </p>
              <div className="font-medium">Budget: £7,500</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/jobs/recommended-1">Apply Now</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Master Bathroom Remodel</CardTitle>
              <CardDescription>Posted 3 days ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>Bathroom Remodeling</Badge>
              <p className="text-sm text-muted-foreground">
                Complete bathroom renovation including new fixtures, tiling, and moving plumbing. Approximately 80 sq ft...
              </p>
              <div className="font-medium">Budget: £4,200</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/jobs/recommended-2">Apply Now</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Home Office Conversion</CardTitle>
              <CardDescription>Posted 5 days ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>General Construction</Badge>
              <p className="text-sm text-muted-foreground">
                Convert garage space into a home office. Includes insulation, electrical work, flooring, and built-in shelving...
              </p>
              <div className="font-medium">Budget: £3,800</div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/jobs/recommended-3">Apply Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="font-medium">Professional Plan</h3>
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
              </div>
              <Badge variant={subscription.status === "ACTIVE" ? "outline" : "destructive"}>
                {subscription.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{subscription.amount}/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-medium">{subscription.nextBillingDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="font-medium">Direct Debit</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Update Payment Method</Button>
            <Button variant="outline">Manage Subscription</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}