"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { User, Menu, X, Home, Search, Building, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export function NavigationMenu() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      if (scrollPosition > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter nav items based on user role - hide contractors browse for clients
  const mainNavItems = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/how-it-works" },
    // Only show "Join as Contractor" for non-clients (guests, contractors)
    ...(user?.role !== 'CUSTOMER' ? [{ label: "Join as Contractor", href: "/contractors" }] : []),
  ]

  return (
    <header
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto py-3 md:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/images/Logo.svg" 
            alt="TrustBuild Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8"
          />
          <span className="text-xl font-bold tracking-tight">TrustBuild</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center space-x-2">
          <ModeToggle />
          
          {/* Show notification bell for authenticated users */}
          {user && <NotificationBell />}
          
          {/* Auth buttons for non-authenticated users */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-background border-b animate-in slide-down z-50">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.href === "/" && <Home className="mr-2 h-4 w-4" />}
                  {item.href === "/contractors" && <Search className="mr-2 h-4 w-4" />}
                  {item.href === "/how-it-works" && <Building className="mr-2 h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Mobile auth buttons */}
            <div className="border-t pt-4 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link 
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}