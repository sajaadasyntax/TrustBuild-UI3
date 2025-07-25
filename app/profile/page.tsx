"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Briefcase, User, ArrowLeft, Mail, Phone, Building, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usersApi, contractorsApi, customersApi, handleApiError } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface ProfileData {
  // User fields
  name: string
  email: string
  
  // Customer fields
  phone?: string
  address?: string
  city?: string
  postcode?: string
  
  // Contractor fields
  businessName?: string
  description?: string
  businessAddress?: string
  website?: string
  instagramHandle?: string
  operatingArea?: string
  servicesProvided?: string
  yearsExperience?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Always fetch basic user data
        const userData = await usersApi.getMe()
        
        let roleSpecificData = {}

        if (user.role === 'CONTRACTOR') {
          try {
            const contractorData = await contractorsApi.getMyProfile()
            roleSpecificData = {
              businessName: contractorData.businessName || "",
              description: contractorData.description || "",
              businessAddress: contractorData.businessAddress || "",
              phone: contractorData.phone || "",
              website: contractorData.website || "",
              instagramHandle: contractorData.instagramHandle || "",
              operatingArea: contractorData.operatingArea || "",
              servicesProvided: contractorData.servicesProvided || "",
              yearsExperience: contractorData.yearsExperience || "",
              city: contractorData.city || "",
              postcode: contractorData.postcode || ""
            }
          } catch (error) {
            console.log("No contractor profile found, using empty data")
          }
        } else if (user.role === 'CUSTOMER') {
          try {
            const customerData = await customersApi.getMyProfile()
            roleSpecificData = {
              phone: customerData.phone || "",
              address: customerData.address || "",
              city: customerData.city || "",
              postcode: customerData.postcode || ""
            }
          } catch (error) {
            console.log("No customer profile found, using empty data")
          }
        }

        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          ...roleSpecificData
        })

      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Update basic user information
      await usersApi.updateMe({
        name: profileData.name,
        email: profileData.email
      })

      // Update role-specific data
      if (user.role === 'CONTRACTOR') {
        const contractorUpdateData = {
          businessName: profileData.businessName,
          description: profileData.description,
          businessAddress: profileData.businessAddress,
          phone: profileData.phone,
          website: profileData.website,
          instagramHandle: profileData.instagramHandle,
          operatingArea: profileData.operatingArea,
          servicesProvided: profileData.servicesProvided,
          yearsExperience: profileData.yearsExperience,
          city: profileData.city,
          postcode: profileData.postcode
        }
        
        try {
          await contractorsApi.updateProfile(contractorUpdateData)
        } catch (error) {
          // If update fails, try to create profile
          if (error instanceof Error && error.message.includes('not found')) {
            await contractorsApi.createProfile(contractorUpdateData)
          } else {
            throw error
          }
        }
      } else if (user.role === 'CUSTOMER') {
        const customerUpdateData = {
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          postcode: profileData.postcode
        }
        
        try {
          await customersApi.updateProfile(customerUpdateData)
        } catch (error) {
          // If update fails, try to create profile
          if (error instanceof Error && error.message.includes('not found')) {
            await customersApi.createProfile(customerUpdateData)
          } else {
            throw error
          }
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setIsEditing(false)

    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getDashboardRoute = () => {
    if (!user) return "/"
    switch (user.role) {
      case 'CONTRACTOR': return "/dashboard/contractor"
      case 'ADMIN': return "/admin"
      case 'SUPER_ADMIN': return "/super-admin"
      default: return "/dashboard/client"
    }
  }

  if (loading) {
    return (
      <div className="container py-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Please log in to view your profile</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your {user.role.toLowerCase()} profile information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={getDashboardRoute()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        
        {/* Basic Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contractor-specific fields */}
        {user.role === 'CONTRACTOR' && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={profileData.businessName || ""}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      value={profileData.yearsExperience || ""}
                      onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., 10 years"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={profileData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className="min-h-[120px]"
                    placeholder="Tell potential clients about your business and expertise..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servicesProvided">Services Provided</Label>
                    <Textarea
                      id="servicesProvided"
                      value={profileData.servicesProvided || ""}
                      onChange={(e) => handleInputChange('servicesProvided', e.target.value)}
                      disabled={!isEditing}
                      placeholder="List your main services..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operatingArea">Operating Areas</Label>
                    <Textarea
                      id="operatingArea"
                      value={profileData.operatingArea || ""}
                      onChange={(e) => handleInputChange('operatingArea', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Areas you serve..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ""}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your contact number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website || ""}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={profileData.businessAddress || ""}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your business address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city || ""}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      value={profileData.postcode || ""}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Postcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramHandle">Instagram Handle</Label>
                    <Input
                      id="instagramHandle"
                      value={profileData.instagramHandle || ""}
                      onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                      disabled={!isEditing}
                      placeholder="@yourhandle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Customer-specific fields */}
        {user.role === 'CUSTOMER' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone || ""}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your contact number"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city || ""}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profileData.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your address"
                />
              </div>

              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={profileData.postcode || ""}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your postcode"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save/Cancel buttons */}
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 