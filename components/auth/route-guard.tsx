"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Admin and Super Admin routes have their own auth handling via AdminAuthContext
    // Skip RouteGuard checks for these routes entirely
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
      return
    }

    // Don't redirect while still loading auth state
    if (loading) return

    // Define public routes that don't require authentication
    const publicRoutes = [
      '/login',
      '/register',
      '/admin/login', // Admin login should be accessible without auth
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
      '/privacy'
    ]

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

    // Define protected routes
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/contractor',
      '/dashboard/client',
      '/admin',
      '/super-admin',
      '/post-job'
    ]

    // Check if current route is protected (but NOT if it's a public route like /admin/login)
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    ) && !isPublicRoute

    // If on a protected route but not authenticated, redirect to login
    if (isProtectedRoute && !user) {
      // console.log("🚫 Accessing protected route without auth, redirecting to login")
      setIsRedirecting(true)
      // If trying to access admin routes, redirect to admin login
      if (pathname.startsWith('/admin')) {
        router.push('/admin/login')
      } else {
        router.push('/login')
      }
      return
    }

    // Role-based access control
    if (user) {
      // Super admin routes - only SUPER_ADMIN role
      if (pathname.startsWith('/super-admin') && user.role !== 'SUPER_ADMIN') {
        setIsRedirecting(true)
        router.push('/admin') // Redirect regular admins to admin panel
        return
      }
      
      // Admin routes - ADMIN and SUPER_ADMIN roles
      if (pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        setIsRedirecting(true)
        router.push(user.role === 'CONTRACTOR' ? '/dashboard/contractor' : '/dashboard/client')
        return
      }
      
      // Contractor dashboard - only CONTRACTOR role
      if (pathname.startsWith('/dashboard/contractor') && user.role !== 'CONTRACTOR') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'SUPER_ADMIN' ? '/super-admin'
          : user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/client'
        router.push(dashboardRoute)
        return
      }
      
      // Client dashboard - only CUSTOMER role
      if (pathname.startsWith('/dashboard/client') && user.role !== 'CUSTOMER') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'SUPER_ADMIN' ? '/super-admin'
          : user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/contractor'
        router.push(dashboardRoute)
        return
      }
      
      // Post job - only CUSTOMER role (customers post jobs, contractors complete them)
      if (pathname === '/post-job' && user.role !== 'CUSTOMER') {
        setIsRedirecting(true)
        const dashboardRoute = user.role === 'SUPER_ADMIN' ? '/super-admin'
          : user.role === 'ADMIN' ? '/admin' 
          : '/dashboard/contractor'
        router.push(dashboardRoute)
        return
      }
    }

    // If authenticated and on login/register/home, redirect to appropriate dashboard
    if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
      setIsRedirecting(true)
      const dashboardRoute = user.role === 'SUPER_ADMIN' ? '/super-admin'
        : user.role === 'ADMIN' ? '/admin' 
        : user.role === 'CONTRACTOR' ? '/dashboard/contractor'
        : '/dashboard/client'
      router.push(dashboardRoute)
      return
    }

    // Reset redirecting state if we're not redirecting
    setIsRedirecting(false)
  }, [user, loading, pathname, router])

  // Admin routes bypass RouteGuard - let them render immediately
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
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

  // Define public routes again for the render check
  const publicRoutes = [
    '/login',
    '/register',
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
    '/privacy'
  ]

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Define protected routes again for the render check
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/contractor',
    '/dashboard/client',
    '/post-job'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  ) && !isPublicRoute

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