"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { NavigationMenu } from "./navigation-menu"
import { DashboardNavigation } from "./dashboard-navigation"

export function ConditionalNavigation() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't render navigation while auth is loading
  if (loading) {
    return null
  }

  // Define routes that should show the home navigation even if user is logged in
  const publicRoutes = ['/login', '/register', '/how-it-works', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Define routes that should show dashboard navigation
  const dashboardRoutes = ['/dashboard', '/admin', '/profile', '/settings', '/post-job', '/jobs', '/contractors']
  const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route))

  // If user is authenticated and not on a public route, show dashboard navigation
  if (user && !isPublicRoute) {
    return <DashboardNavigation />
  }

  // For unauthenticated users or public routes, show home navigation
  return <NavigationMenu />
} 