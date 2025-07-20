"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  Wrench, 
  MapPin, 
  MessageCircle, 
  FileText, 
  Users,
  Star,
  Shield,
  TrendingUp,
  Search
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Welcome to TrustBuild
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Connecting Customers with Trusted Contractors
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TrustBuild is a platform designed to connect homeowners and property managers with skilled and verified contractors across the UK. Whether you&apos;re planning a full renovation, a bathroom remodel, or just need a painter, we make it easy to find professionals you can trust.
            </p>
          </div>
        </div>
      </div>

      {/* Why TrustBuild Section */}
      <div className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Why TrustBuild?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Verified Contractors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All contractors go through our verification process to ensure they have proven experience and credentials.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    Wide Range of Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Renovations, tiling, kitchens, bathrooms, painting, and more – find specialists for any project.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-purple-600" />
                    Local Professionals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Find contractors based on your postcode who understand local requirements and regulations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageCircle className="h-6 w-6 text-orange-600" />
                    Transparent Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Direct communication between customers and contractors with built-in messaging and project updates.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-teal-600" />
                    Clear Pricing & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Transparent pricing, comprehensive review system, and secure job confirmation for peace of mind.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-red-600" />
                    Secure Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Safe and secure platform with payment protection and dispute resolution services.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* For Customers & Contractors Section */}
      <div className="bg-muted/50 py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* For Customers */}
              <Card className="h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">For Customers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Post Your Job</h4>
                        <p className="text-sm text-muted-foreground">Describe your project in minutes with photos and requirements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Receive Interest</h4>
                        <p className="text-sm text-muted-foreground">Get quotes and proposals from qualified professionals</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Choose with Confidence</h4>
                        <p className="text-sm text-muted-foreground">Review profiles, ratings, and past work to make the right choice</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-center text-muted-foreground mb-6">
                      Post your job in minutes, receive interest from professionals, and choose the right one for you with confidence.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/post-job">
                        Post a Job
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* For Contractors */}
              <Card className="h-full">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">For Contractors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Create Your Profile</h4>
                        <p className="text-sm text-muted-foreground">Showcase your skills, experience, and previous work</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Access New Projects</h4>
                        <p className="text-sm text-muted-foreground">Browse and apply for jobs that match your expertise</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Grow Your Business</h4>
                        <p className="text-sm text-muted-foreground">Build reputation through verified leads and customer reviews</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-center text-muted-foreground mb-6">
                      Access new projects, showcase your skills, and grow your business through verified leads and customer reviews.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/register">
                        Join as Contractor
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              TrustBuild – Building Trust, One Job at a Time
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to get started? Whether you&apos;re looking to hire a contractor or join our network of professionals, we&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/jobs">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 