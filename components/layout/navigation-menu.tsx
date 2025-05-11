"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Menu, X, Home, PanelRight, Search, Briefcase, Building, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function NavigationMenu() {
  const pathname = usePathname()
  const { data: session } = useSession()
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

  const mainNavItems = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/how-it-works" },
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
          
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={session?.user?.role === "CONTRACTOR" ? "/dashboard/contractor" : "/dashboard/client"}>
                    <PanelRight className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {session?.user?.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Building className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
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
        <div className="md:hidden bg-background border-b animate-in slide-down">
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
                  {item.href === "/post-job" && <Briefcase className="mr-2 h-4 w-4" />}
                  {item.href === "/how-it-works" && <Building className="mr-2 h-4 w-4" />}
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {session ? (
              <div className="border-t pt-4">
                <Link 
                  href={session?.user?.role === "CONTRACTOR" ? "/dashboard/contractor" : "/dashboard/client"}
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PanelRight className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link 
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <Link 
                  href="/api/auth/signout"
                  className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign out
                </Link>
              </div>
            ) : (
              <div className="border-t pt-4 flex flex-col space-y-2">
                <Button variant="outline" asChild>
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link 
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}