"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { NavigationMenu } from "./navigation-menu"
import { DashboardNavigation } from "./dashboard-navigation"

export function ConditionalNavigation() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Auth pages that should always show home navigation
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.includes(pathname)

  // console.log("🧭 ConditionalNavigation:", { 
  //   user: user?.role, 
  //   loading, 
  //   pathname, 
  //   isAuthRoute,
  //   shouldShowDashboard: !!(user && !isAuthRoute)
  // })

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="h-14 w-full bg-background border-b">
        <div className="container flex h-14 items-center">
          <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  // Authenticated users see dashboard navigation (except on auth pages)
  if (user && !isAuthRoute) {
    return <DashboardNavigation />
  }

  // Everyone else sees home navigation
  return <NavigationMenu />
} 