"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Shield } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type FormData = z.infer<typeof formSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api'
      
      // Don't add /api prefix if API_URL already includes it
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`
      
      const response = await fetch(`${baseUrl}/admin-auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      // Check if 2FA is required
      if (result.data.requires2FA) {
        // Store temp token and show 2FA verification page
        localStorage.setItem('admin_temp_token', result.data.tempToken)
        toast({
          title: "2FA Required",
          description: "Please enter your authenticator code",
        })
        router.push('/admin/verify-2fa')
        return
      }

      // Store admin token
      localStorage.setItem('admin_token', result.data.token)
      localStorage.setItem('admin_user', JSON.stringify(result.data.admin))

      toast({
        title: "Welcome back!",
        description: `Logged in as ${result.data.admin.name}`,
      })

      // Redirect to admin dashboard
      router.push('/admin')
      router.refresh()

    } catch (error) {
      console.error('Admin login error:', error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-center font-bold">Admin Portal</CardTitle>
          <CardDescription className="text-center text-base">
            Sign in with your administrator credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                placeholder="admin@trustbuild.uk"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="px-1 text-xs text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...form.register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="px-1 text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button 
              disabled={isLoading} 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In to Admin Portal
            </Button>
          </form>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Admin Access Only</strong><br/>
              This portal is for authorized administrators only. All login attempts are monitored and logged.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Not an admin?{" "}
        <a
          href="/login"
          className="hover:text-brand underline underline-offset-4 font-medium"
        >
          Customer/Contractor Login
        </a>
      </p>
    </div>
  )
}

