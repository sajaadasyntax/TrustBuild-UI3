"use client"

import { useState } from "react"
import { FileText, Edit, Save, Eye, Globe, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PlatformContentPage() {
  const [isEditing, setIsEditing] = useState({
    hero: false,
    features: false,
    testimonials: false,
    about: false,
  })

  const [content, setContent] = useState({
    hero: {
      title: "Find Trusted Contractors for Your Home Projects",
      subtitle: "Connect with verified professionals for kitchen renovations, bathroom remodeling, and home improvements.",
      ctaText: "Get Started Today",
    },
    features: [
      {
        title: "Verified Contractors",
        description: "All contractors are thoroughly vetted and verified for your peace of mind.",
        icon: "shield",
      },
      {
        title: "Quality Guarantee",
        description: "We guarantee the quality of work and provide dispute resolution.",
        icon: "star",
      },
      {
        title: "Transparent Pricing",
        description: "Get clear, upfront pricing with no hidden fees or surprises.",
        icon: "dollar",
      },
    ],
    testimonials: [
      {
        name: "Sarah Johnson",
        comment: "TrustBuild helped me find an amazing contractor for my kitchen renovation. The process was smooth and professional.",
        rating: 5,
        project: "Kitchen Renovation",
      },
      {
        name: "Mike Davis",
        comment: "Excellent service! The contractor was reliable and delivered exactly what was promised.",
        rating: 5,
        project: "Bathroom Remodeling",
      },
    ],
    about: {
      mission: "To connect homeowners with trusted, verified contractors for seamless home improvement projects.",
      vision: "Building trust in the home improvement industry through transparency and quality assurance.",
      values: "Integrity, Quality, Transparency, Customer Satisfaction",
    },
  })

  const handleSave = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }))
    // Here you would typically save to your backend
    console.log(`Saving ${section} content...`)
  }

  const handleEdit = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: true }))
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Platform Content Management</h1>
        </div>
        <p className="text-muted-foreground">
          Edit and manage content displayed across the TrustBuild platform
        </p>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Hero Section
                  </CardTitle>
                  <CardDescription>Main homepage hero section content</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  {!isEditing.hero ? (
                    <Button size="sm" onClick={() => handleEdit('hero')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleSave('hero')}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Main Title</label>
                {isEditing.hero ? (
                  <Input
                    value={content.hero.title}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted rounded">{content.hero.title}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Subtitle</label>
                {isEditing.hero ? (
                  <Textarea
                    value={content.hero.subtitle}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted rounded">{content.hero.subtitle}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">CTA Button Text</label>
                {isEditing.hero ? (
                  <Input
                    value={content.hero.ctaText}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, ctaText: e.target.value }
                    }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted rounded">{content.hero.ctaText}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <div className="space-y-6">
            {content.features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Feature {index + 1}
                      </CardTitle>
                      <CardDescription>Feature section content</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <p className="mt-1 p-2 bg-muted rounded">{feature.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="mt-1 p-2 bg-muted rounded">{feature.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Icon</label>
                    <Badge variant="outline" className="mt-1">{feature.icon}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="space-y-6">
            {content.testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Testimonial {index + 1}
                      </CardTitle>
                      <CardDescription>Customer testimonial content</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Customer Name</label>
                    <p className="mt-1 p-2 bg-muted rounded">{testimonial.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <p className="mt-1 p-2 bg-muted rounded">{testimonial.comment}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <p className="mt-1 p-2 bg-muted rounded">
                        {"⭐".repeat(testimonial.rating)} ({testimonial.rating}/5)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project Type</label>
                      <p className="mt-1 p-2 bg-muted rounded">{testimonial.project}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Add New Testimonial
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    About Us Content
                  </CardTitle>
                  <CardDescription>Company information and values</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mission Statement</label>
                <p className="mt-1 p-3 bg-muted rounded">{content.about.mission}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Vision</label>
                <p className="mt-1 p-3 bg-muted rounded">{content.about.vision}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Core Values</label>
                <p className="mt-1 p-3 bg-muted rounded">{content.about.values}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Statistics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
          <CardDescription>Analytics for platform content engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12,450</div>
              <p className="text-sm text-muted-foreground">Homepage Views</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">3,240</div>
              <p className="text-sm text-muted-foreground">CTA Clicks</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">26%</div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">4.2s</div>
              <p className="text-sm text-muted-foreground">Avg. Time on Page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 