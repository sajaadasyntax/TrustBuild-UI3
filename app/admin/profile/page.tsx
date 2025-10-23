"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Mail, Calendar, RefreshCw, Lock, ShieldCheck, ShieldOff } from "lucide-react"
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { adminApi } from '@/lib/adminApi'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function AdminProfilePage() {
  const { admin, loading: authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const handleEnable2FA = async () => {
    try {
      setLoading(true)
      const response = await adminApi.enable2FA()
      setQrCode(response.qrCode)
      setSecret(response.secret)
      setShow2FADialog(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationToken) {
      toast({
        title: "Validation Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await adminApi.verify2FASetup(verificationToken)
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully",
      })
      setShow2FADialog(false)
      setVerificationToken('')
      setQrCode('')
      setSecret('')
      window.location.reload() // Refresh to update admin state
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your password",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await adminApi.disable2FA(disablePassword)
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
      })
      setShowDisable2FADialog(false)
      setDisablePassword('')
      window.location.reload() // Refresh to update admin state
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA. Please check your password.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings and security preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{admin.name}</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{admin.email}</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={
                  admin.role === 'SUPER_ADMIN' ? 'default' :
                  admin.role === 'FINANCE_ADMIN' ? 'secondary' :
                  'outline'
                }>
                  {admin.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Member Since</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(admin.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            {admin.lastLoginAt && (
              <div className="grid gap-2">
                <Label>Last Login</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(admin.lastLoginAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <Label>Two-Factor Authentication</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <div className="mt-2">
                  {admin.twoFAEnabled ? (
                    <Badge className="bg-green-100 text-green-800">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <ShieldOff className="w-3 h-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                {admin.twoFAEnabled ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDisable2FADialog(true)}
                    disabled={loading}
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <Button
                    onClick={handleEnable2FA}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Enable 2FA'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enable 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
                  <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                    {secret}
                  </code>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShow2FADialog(false)
              setVerificationToken('')
              setQrCode('')
              setSecret('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleVerify2FA} disabled={loading || !verificationToken}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Enable'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDisable2FADialog(false)
              setDisablePassword('')
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA} 
              disabled={loading || !disablePassword}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

