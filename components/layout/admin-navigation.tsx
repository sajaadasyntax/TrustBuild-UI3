"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, LogOut, Settings, Users, Building2, FileText, CreditCard } from "lucide-react"
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

export function AdminNavigation() {
  const { admin, logout } = useAdminAuth()
  const pathname = usePathname()

  if (!admin) return null

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Shield },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/contractors", label: "Contractors", icon: Building2 },
    { href: "/admin/jobs", label: "Jobs", icon: FileText },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
  ]

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
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

