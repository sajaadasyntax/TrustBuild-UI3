"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Briefcase, Image as ImageIcon, Star, Clock, FileCheck, User } from "lucide-react"

export default function ContractorProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])

  // Mock data - in a real app, this would come from your backend
  const contractorData = {
    name: "John Smith",
    businessName: "Smith Construction Co.",
    rating: 4.9,
    reviews: 48,
    bio: "Professional contractor with over 10 years of experience in residential and commercial construction. Specializing in kitchen and bathroom renovations.",
    services: [
      "Kitchen Remodeling",
      "Bathroom Renovation",
      "Home Additions",
      "General Contracting",
      "Interior Design"
    ],
    areasCovered: [
      "New York City",
      "Brooklyn",
      "Queens",
      "Long Island"
    ]
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contractor Profile</h1>
            <p className="text-muted-foreground">Manage your profile and showcase your work</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
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
          </div>
        </div>
        
        {/* Profile Picture Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <Button variant="outline" onClick={() => document.getElementById('profile-upload')?.click()}>
                  Upload Photo
                </Button>
                <input
                  id="profile-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setProfileImage(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bio/Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              defaultValue={contractorData.bio}
              className="min-h-[150px]"
              placeholder="Tell potential clients about yourself and your business..."
            />
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractorData.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input defaultValue={service} />
                  <Button variant="ghost" size="icon">
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Add Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Areas Covered Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Areas Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractorData.areasCovered.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input defaultValue={area} />
                  <Button variant="ghost" size="icon">
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Add Area
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioImages.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPortfolioImages(images => images.filter((_, i) => i !== index))
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center">
                <Button
                  variant="ghost"
                  onClick={() => document.getElementById('portfolio-upload')?.click()}
                >
                  Add Image
                </Button>
                <input
                  id="portfolio-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setPortfolioImages(images => [...images, reader.result as string])
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
} 