"use client"

import { useState } from "react"
import { Shield, AlertTriangle, Flag, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ContentModerationPage() {
  const router = useRouter()

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

