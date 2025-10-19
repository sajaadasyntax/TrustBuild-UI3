"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Briefcase, User, ArrowLeft, Mail, Phone, Building, Save, Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usersApi, contractorsApi, customersApi, uploadApi, handleApiError } from "@/lib/api"
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
  logoUrl?: string
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
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

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
              logoUrl: contractorData.logoUrl || "",
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    try {
      const uploadResult = await uploadApi.uploadFile(file)
      handleInputChange('logoUrl', uploadResult.url)
      
      toast({
        title: "Logo uploaded successfully",
        description: "Your business logo has been uploaded."
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      })
    }
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

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      setChangingPassword(true)
      await usersApi.changePassword(passwordData)
      toast({
        title: "Success",
        description: "Password changed successfully!",
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error) {
      handleApiError(error, 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const getDashboardRoute = () => {
    if (!user) return "/"
    switch (user.role) {
      case 'CONTRACTOR': return "/dashboard/contractor"
      case 'ADMIN': return "/admin"
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

                {/* Logo Upload Section */}
                <div>
                  <Label htmlFor="logo">Business Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {profileData.logoUrl && (
                      <div className="relative">
                        <Image
                          src={profileData.logoUrl}
                          alt="Business Logo"
                          width={80}
                          height={80}
                          className="rounded-lg object-cover border"
                        />
                        {isEditing && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => handleInputChange('logoUrl', '')}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    )}
                    {isEditing && (
                      <div className="flex-1">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a square logo (recommended: 200x200px or larger)
                        </p>
                      </div>
                    )}
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

        {/* Password Change Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password (min 8 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>

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