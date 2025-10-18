"use client"

import { useState, useEffect } from "react"
import { Flag, AlertTriangle, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function FlaggedContentPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<any[]>([])

  useEffect(() => {
    fetchFlaggedContent()
  }, [])

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
      const token = localStorage.getItem('admin_token')

      const response = await fetch(`${baseUrl}/admin/content/flagged`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch flagged content')
      }

      const data = await response.json()
      setContent(data.data.content || [])
    } catch (error) {
      console.error('Failed to fetch flagged content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch flagged content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading flagged content...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Flag className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold">Flagged Content</h1>
        </div>
        <p className="text-muted-foreground">
          Review and moderate flagged content from the platform
        </p>
      </div>

      {content.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Flagged Content</h3>
            <p className="text-muted-foreground">
              There is no flagged content to review at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {content.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={
                        item.severity === 'high' ? 'destructive' :
                        item.severity === 'medium' ? 'default' : 'secondary'
                      }>
                        {item.severity}
                      </Badge>
                      {item.type}
                    </CardTitle>
                    <CardDescription>{item.title}</CardDescription>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">Approve</Button>
                    <Button size="sm" variant="destructive">Reject</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

