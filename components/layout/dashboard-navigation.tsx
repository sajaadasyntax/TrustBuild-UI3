"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  User, 
  Menu, 
  X, 
  Home, 
  PanelRight, 
  Star, 
  LogOut, 
  Briefcase, 
  Settings,
  Calendar,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  Award,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export function DashboardNavigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { label: "Dashboard", href: user?.role === "CONTRACTOR" ? "/dashboard/contractor" : "/dashboard/client", icon: PanelRight },
    ]

    if (user?.role === "CONTRACTOR") {
      return [
        ...baseItems,
        { label: "Jobs", href: "/jobs", icon: Briefcase },
        { label: "Reviews", href: "/dashboard/contractor/reviews", icon: Star },
        { label: "Payments", href: "/dashboard/contractor/payments", icon: CreditCard },
        { label: "Commissions", href: "/dashboard/contractor/commissions", icon: BarChart3 },
        { label: "Invoices", href: "/dashboard/contractor/invoices", icon: FileText },
      ]
    } else if (user?.role === "CUSTOMER") {
      return [
        ...baseItems,
        { label: "Featured Contractors", href: "/dashboard/featured-contractors", icon: Award },
        { label: "Post Job", href: "/post-job", icon: Briefcase },
        { label: "My Jobs", href: "/dashboard/client/current-jobs", icon: FileText },
        { label: "Messages", href: "/dashboard/client/messages", icon: MessageSquare },
        { label: "Reviews", href: "/dashboard/client/reviews", icon: Star },
      ]
    } else if (user?.role === "ADMIN") {
      return [
        { label: "Admin Dashboard", href: "/admin", icon: PanelRight },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Contractors", href: "/admin/contractors", icon: Users },
        { label: "Jobs", href: "/admin/jobs", icon: BarChart3 },
        { label: "Payments", href: "/admin/payments", icon: CreditCard },
        { label: "Invoices", href: "/admin/invoices", icon: FileText },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  const handleLogout = async () => {
    try {
      await logout()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={user?.role === "CONTRACTOR" ? "/dashboard/contractor" : user?.role === "ADMIN" ? "/admin" : "/dashboard/client"} className="mr-6 flex items-center space-x-2">
            <Image 
              src="/images/Logo.svg" 
              alt="TrustBuild Logo" 
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="hidden font-bold sm:inline-block">TrustBuild</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href={user?.role === "CONTRACTOR" ? "/dashboard/contractor" : user?.role === "ADMIN" ? "/admin" : "/dashboard/client"} className="flex items-center space-x-2 md:hidden">
              <Image 
                src="/images/Logo.svg" 
                alt="TrustBuild Logo" 
                width={24} 
                height={24} 
                className="h-6 w-6"
              />
              <span className="font-bold">TrustBuild</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            
            {/* Show notification bell for authenticated users */}
            {user && <NotificationBell />}
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 p-0"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-50 grid h-[calc(100vh-3.5rem)] w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            {/* User Info */}
            <div className="flex items-center space-x-2 pb-2 border-b">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="grid grid-flow-row auto-rows-max text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline",
                    pathname === item.href ? "text-foreground" : "text-foreground/60"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              
              {/* Profile and Settings */}
              <Link
                href="/profile"
                className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline text-foreground/60"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
              

              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline text-red-600 mt-2 pt-4 border-t"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
} 