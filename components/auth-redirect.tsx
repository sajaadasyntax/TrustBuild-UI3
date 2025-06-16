"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface AuthRedirectProps {
  redirectTo?: string
  children: React.ReactNode
}

export function AuthRedirect({ redirectTo, children }: AuthRedirectProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && redirectTo) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is authenticated and should be redirected, don't render children
  if (user && redirectTo) {
    return null
  }

  return <>{children}</>
}

interface DashboardRedirectProps {
  children: React.ReactNode
}

export function DashboardRedirect({ children }: DashboardRedirectProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin')
      } else if (user.role === 'CONTRACTOR') {
        router.push('/dashboard/contractor')
      } else {
        router.push('/dashboard/client')
      }
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is authenticated, don't render children (redirect will happen)
  if (user) {
    return null
  }

  return <>{children}</>
} 