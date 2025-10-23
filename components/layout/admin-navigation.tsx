"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LogOut, Settings, Users, Building2, FileText, CreditCard, Star, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

// Helper function to check admin permissions
function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

export function AdminNavigation() {
  const { admin, logout } = useAdminAuth()
  const pathname = usePathname()

  if (!admin) return null

  const isSuperAdmin = admin.role === 'SUPER_ADMIN'
  const permissions = admin.permissions || []

  // Define navigation items with their required permissions
  const allNavItems = [
    { 
      href: "/admin", 
      label: "Dashboard", 
      icon: Shield,
      requiredPermissions: [], // Dashboard is always visible
    },
    { 
      href: "/admin/users", 
      label: "Users", 
      icon: Users,
      requiredPermissions: ['users:read', 'users:write'],
    },
    { 
      href: "/admin/contractors", 
      label: "Contractors", 
      icon: Building2,
      requiredPermissions: ['contractors:read', 'contractors:write'],
    },
    { 
      href: "/admin/jobs", 
      label: "Jobs", 
      icon: FileText,
      requiredPermissions: ['jobs:read', 'jobs:write'],
    },
    { 
      href: "/admin/reviews", 
      label: "Reviews", 
      icon: Star,
      requiredPermissions: ['reviews:read', 'reviews:write'],
    },
    { 
      href: "/admin/content", 
      label: "Content", 
      icon: Folder,
      requiredPermissions: ['content:read', 'content:write'],
    },
    { 
      href: "/admin/payments", 
      label: "Payments", 
      icon: CreditCard,
      requiredPermissions: ['payments:read'],
    },
    { 
      href: "/admin/settings", 
      label: "Settings", 
      icon: Settings,
      requiredPermissions: ['settings:read', 'settings:write'],
    },
  ]

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    // Dashboard is always visible
    if (item.requiredPermissions.length === 0) return true
    // Super admin sees everything
    if (isSuperAdmin) return true
    // Check if user has any of the required permissions
    return hasAnyPermission(permissions, item.requiredPermissions)
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/admin" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">TrustBuild Admin</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{admin.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    Role: {admin.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(isSuperAdmin || hasAnyPermission(permissions, ['settings:read', 'settings:write'])) && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

