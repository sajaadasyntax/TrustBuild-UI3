"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/admin/login',
  '/forgot-password',
  '/',
  '/about',
  '/contact',
  '/how-it-works',
  '/for-contractors',
  '/contractors',
  '/jobs',
  '/pricing',
  '/faq',
  '/terms',
  '/privacy',
  '/homeowners',
]

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/post-job',
]

function matchesRoute(pathname: string, route: string) {
  return route === '/'
    ? pathname === '/'
    : pathname === route || pathname.startsWith(`${route}/`)
}

function getPostJobRedirect() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('redirect') === '/post-job'
    ? '/post-job'
    : null
}

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Admin routes have their own auth handling via AdminAuthContext
    // Skip RouteGuard checks for these routes entirely
    if (pathname.startsWith('/admin')) {
      return
    }

    // Don't redirect while still loading auth state
    if (loading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => matchesRoute(pathname, route))

    const isProtectedRoute = PROTECTED_ROUTES.some(route => matchesRoute(pathname, route)) && !isPublicRoute

    // If on a protected route but not authenticated, redirect to login
    if (isProtectedRoute && !user) {
      // console.log("🚫 Accessing protected route without auth, redirecting to login")
      setIsRedirecting(true)
      // If trying to access admin routes, redirect to admin login
      if (pathname.startsWith('/admin')) {
        router.push('/admin/login')
      } else {
        const loginUrl = pathname === '/post-job'
          ? '/login?redirect=%2Fpost-job'
          : '/login'
        router.push(loginUrl)
      }
      return
    }

    // Role-based access control
    if (user) {
      // Admin routes - ADMIN and SUPER_ADMIN roles (legacy user roles, not actually used)
      if (pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        setIsRedirecting(true)
        router.push(user.role === 'CONTRACTOR' ? '/dashboard/contractor' : '/dashboard/client')
        return
      }
      
      // Contractor dashboard - only CONTRACTOR role
      if (pathname.startsWith('/dashboard/contractor') && user.role !== 'CONTRACTOR') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/client'
        router.push(dashboardRoute)
        return
      }
      
      // Client dashboard - only CUSTOMER role
      if (pathname.startsWith('/dashboard/client') && user.role !== 'CUSTOMER') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/contractor'
        router.push(dashboardRoute)
        return
      }
      
      // Post job - only CUSTOMER role (customers post jobs, contractors complete them)
      if (pathname === '/post-job' && user.role !== 'CUSTOMER') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/contractor'
        router.push(dashboardRoute)
        return
      }
    }

    // If authenticated and on login/register/home, redirect to appropriate dashboard
    if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      setIsRedirecting(true)
      const dashboardRoute = user.role === 'ADMIN' ? '/admin' 
        : user.role === 'CONTRACTOR' ? '/dashboard/contractor'
        : '/dashboard/client'
      const requestedRedirect = getPostJobRedirect()
      router.push(requestedRedirect && user.role === 'CUSTOMER' ? requestedRedirect : dashboardRoute)
      return
    }

    // Reset redirecting state if we're not redirecting
    setIsRedirecting(false)
  }, [user, loading, pathname, router])

  // Admin routes bypass RouteGuard - let them render immediately
  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  // Show loading while checking auth or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : "Redirecting..."}
          </p>
        </div>
      </div>
    )
  }

  const isPublicRoute = PUBLIC_ROUTES.some(route => matchesRoute(pathname, route))
  const isProtectedRoute = PROTECTED_ROUTES.some(route => matchesRoute(pathname, route)) && !isPublicRoute

  // Don't render protected content if user is not authenticated
  if (isProtectedRoute && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">User not authenticated, redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 