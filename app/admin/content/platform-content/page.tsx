"use client"

import { useState, useEffect } from "react"
import { FileText, Edit, Save, Eye, Globe, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PlatformContentPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState({
    hero: false,
    features: false,
    howItWorks: false,
    testimonials: false,
    about: false,
    stats: false,
  })

  const [content, setContent] = useState({
    hero: {
      title: "",
      subtitle: "",
      ctaText: "",
      ctaSecondaryText: "",
    },
    features: [] as Array<{
      title: string
      description: string
      icon: string
    }>,
    howItWorks: [] as Array<{
      step: number
      title: string
      description: string
      icon: string
    }>,
    testimonials: [] as Array<{
      name: string
      comment: string
      rating: number
      project: string
    }>,
    about: {
      mission: "",
      vision: "",
      values: "",
    },
    stats: {
      projectsCompleted: "",
      verifiedContractors: "",
      customerSatisfaction: "",
      averageRating: "",
    },
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const platformContent = await adminApi.getPlatformContent()
      setContent(platformContent)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch platform content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: keyof typeof content) => {
    try {
      setSaving(true)
      await adminApi.updateContentSection(section, content[section])
      setIsEditing(prev => ({ ...prev, [section]: false }))
      toast({
        title: "Success",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    try {
      setSaving(true)
      await adminApi.updatePlatformContent(content)
      setIsEditing({
        hero: false,
        features: false,
        howItWorks: false,
        testimonials: false,
        about: false,
        stats: false,
      })
      toast({
        title: "Success",
        description: "All content updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all content to defaults? This cannot be undone.")) {
      return
    }

    try {
      setSaving(true)
      const defaultContent = await adminApi.resetPlatformContent()
      setContent(defaultContent)
      toast({
        title: "Success",
        description: "Content reset to defaults successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (section: keyof typeof isEditing) => {
    setIsEditing(prev => ({ ...prev, [section]: true }))
  }

  if (loading) {
    return (
      <div className="container py-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Platform Content Management</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveAll} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Edit and manage content displayed across the TrustBuild platform. Changes will be reflected on the live site immediately.
        </p>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
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
                  {!isEditing.hero ? (
                    <Button size="sm" onClick={() => handleEdit('hero')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleSave('hero')} disabled={saving}>
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
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-2 bg-muted rounded">{content.hero.subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary CTA Button Text</label>
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
                <div>
                  <label className="text-sm font-medium">Secondary CTA Button Text</label>
                  {isEditing.hero ? (
                    <Input
                      value={content.hero.ctaSecondaryText}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaSecondaryText: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{content.hero.ctaSecondaryText}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How It Works Steps</CardTitle>
              <CardDescription>Steps displayed on the homepage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.howItWorks.map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <p className="mt-1 p-2 bg-muted rounded text-sm">{step.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Icon</label>
                        <p className="mt-1 p-2 bg-muted rounded text-sm">{step.icon}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm font-medium">Description</label>
                      <p className="mt-1 p-2 bg-muted rounded text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <div className="space-y-6">
            {content.features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Feature {index + 1}</CardTitle>
                  <CardDescription>{feature.title}</CardDescription>
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
                    <p className="mt-1 p-2 bg-muted rounded text-sm">{feature.icon}</p>
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
                  <CardTitle>Testimonial {index + 1}</CardTitle>
                  <CardDescription>{testimonial.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Customer Name</label>
                      <p className="mt-1 p-2 bg-muted rounded">{testimonial.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project Type</label>
                      <p className="mt-1 p-2 bg-muted rounded">{testimonial.project}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <p className="mt-1 p-2 bg-muted rounded">{testimonial.comment}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rating</label>
                    <p className="mt-1 p-2 bg-muted rounded">
                      {"⭐".repeat(testimonial.rating)} ({testimonial.rating}/5)
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  {!isEditing.about ? (
                    <Button size="sm" onClick={() => handleEdit('about')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleSave('about')} disabled={saving}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mission Statement</label>
                {isEditing.about ? (
                  <Textarea
                    value={content.about.mission}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      about: { ...prev.about, mission: e.target.value }
                    }))}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-3 bg-muted rounded">{content.about.mission}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Vision</label>
                {isEditing.about ? (
                  <Textarea
                    value={content.about.vision}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      about: { ...prev.about, vision: e.target.value }
                    }))}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-3 bg-muted rounded">{content.about.vision}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Core Values</label>
                {isEditing.about ? (
                  <Textarea
                    value={content.about.values}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      about: { ...prev.about, values: e.target.value }
                    }))}
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 p-3 bg-muted rounded">{content.about.values}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Platform Statistics</CardTitle>
                  <CardDescription>Stats displayed on the homepage</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing.stats ? (
                    <Button size="sm" onClick={() => handleEdit('stats')}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleSave('stats')} disabled={saving}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Projects Completed</label>
                  {isEditing.stats ? (
                    <Input
                      value={content.stats.projectsCompleted}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        stats: { ...prev.stats, projectsCompleted: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{content.stats.projectsCompleted}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Verified Contractors</label>
                  {isEditing.stats ? (
                    <Input
                      value={content.stats.verifiedContractors}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        stats: { ...prev.stats, verifiedContractors: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{content.stats.verifiedContractors}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Customer Satisfaction</label>
                  {isEditing.stats ? (
                    <Input
                      value={content.stats.customerSatisfaction}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        stats: { ...prev.stats, customerSatisfaction: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{content.stats.customerSatisfaction}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Average Rating</label>
                  {isEditing.stats ? (
                    <Input
                      value={content.stats.averageRating}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        stats: { ...prev.stats, averageRating: e.target.value }
                      }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{content.stats.averageRating}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="mt-8">
        <AlertDescription>
          <strong>Note:</strong> Changes made here will be immediately visible on the live website after saving. Make sure to preview your changes before saving.
        </AlertDescription>
      </Alert>
    </div>
  )
}
