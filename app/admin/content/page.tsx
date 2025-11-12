"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Flag, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { toast } from "@/hooks/use-toast"

// Helper function to check admin permissions
function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

export default function ContentModerationPage() {
  const router = useRouter()
  const { admin, loading: authLoading } = useAdminAuth()
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const permissions = admin?.permissions || []
  
  // Route guard - check if admin has access to content
  useEffect(() => {
    if (!authLoading && admin) {
      const canAccessContent = isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])
      if (!canAccessContent) {
        router.push('/admin')
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the Content Moderation page.",
          variant: "destructive",
        })
      }
    }
  }, [admin, authLoading, isSuperAdmin, permissions, router])
  
  // Don't render if no access
  if (!authLoading && admin) {
    const canAccessContent = isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])
    if (!canAccessContent) {
      return null
    }
  }

  const contentCategories = [
    {
      title: "Flagged Content",
      description: "Review and moderate flagged reviews, job descriptions, and profiles",
      icon: Flag,
      href: "/admin/content/flagged",
      count: 0,
      color: "destructive" as const,
    },
    {
      title: "Platform Content",
      description: "Manage platform-wide content, announcements, and policies",
      icon: FileText,
      href: "/admin/content/platform-content",
      count: null,
      color: "default" as const,
    },
    {
      title: "FAQ Management",
      description: "Create, edit, and organize frequently asked questions",
      icon: Shield,
      href: "/admin/content/faq",
      count: null,
      color: "default" as const,
    },
    {
      title: "Featured Contractors",
      description: "Manage featured contractor listings and promotions",
      icon: AlertTriangle,
      href: "/admin/content/featured-contractors",
      count: null,
      color: "default" as const,
    },
  ]

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Content Moderation</h1>
        </div>
        <p className="text-muted-foreground">
          Manage and moderate platform content, reviews, and listings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentCategories.map((category) => (
          <Card key={category.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.title}
                {category.count !== null && (
                  <Badge variant={category.color}>{category.count}</Badge>
                )}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => router.push(category.href)}
              >
                Manage {category.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

