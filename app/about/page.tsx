"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Star, MapPin, Wrench, MessageCircle, Loader2 } from "lucide-react"
import { contentApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// Default content as fallback
const DEFAULT_CONTENT = {
  mission: "To connect homeowners with trusted, verified contractors for seamless home improvement projects.",
  vision: "Building trust in the home improvement industry through transparency and quality assurance.",
  values: "Integrity, Quality, Transparency, Customer Satisfaction",
}

export default function AboutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [contentLoading, setContentLoading] = useState(true)

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CONTRACTOR') {
        router.push('/dashboard/contractor')
      } else if (user.role === 'CUSTOMER') {
        router.push('/dashboard/client')
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin')
      }
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setContentLoading(true)
      const platformContent = await contentApi.getPlatformContent()
      if (platformContent.about) {
        setContent(platformContent.about)
      }
    } catch (error) {
      console.error('Failed to load about content, using defaults:', error)
      // Use default content on error
    } finally {
      setContentLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render if redirecting
  if (user) {
    return null
  }

  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          TrustBuild is a UK-based platform built to connect customers with trusted renovation and construction professionals. Whether you&apos;re upgrading a kitchen, painting a flat, or managing a full refurbishment, we help you find the right contractor with confidence.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contentLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  content.mission
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contentLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  content.vision
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {contentLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  content.values
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Customer Focused</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our platform prioritizes homeowners by offering an easy-to-use system for finding qualified contractors.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Verified Professionals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All contractors are vetted and verified to ensure peace of mind for every project.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Quality & Trust</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We promote honesty and high standards through ratings, reviews, and transparent processes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Nationwide Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find trusted contractors across the UK for any type of renovation or construction project.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Wrench className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Wide Range of Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              From kitchen renovations to full home makeovers, find specialists for any project.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Transparent Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Direct communication between customers and contractors with built-in messaging and project updates.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We&apos;re committed to building a community of trusted professionals and satisfied customers. 
              Our platform is designed to make finding and hiring contractors as simple and stress-free as possible.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
