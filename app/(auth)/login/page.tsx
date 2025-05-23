"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    
    try {
      // In a real app, this would call your auth API
      console.log("Login submitted:", data)
      
      // Mock successful login for demo purposes
      if (data.email === "contractor@example.com") {
        router.push("/dashboard/contractor")
      } else if (data.email === "admin@example.com") {
        router.push("/admin")
      } else if (data.email === "superadmin@example.com") {
        router.push("/super-admin")
      } else {
        router.push("/dashboard/client")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-32">
      <Card className="mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Image 
              src="/images/Logo.svg" 
              alt="TrustBuild Logo" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your TrustBuild account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Demo accounts:</span>
            <div className="flex flex-col gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  form.setValue("email", "customer@example.com");
                  form.setValue("password", "password");
                }}
              >
                Customer Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  form.setValue("email", "contractor@example.com");
                  form.setValue("password", "password");
                }}
              >
                Contractor Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  form.setValue("email", "admin@example.com");
                  form.setValue("password", "password");
                }}
              >
                Admin Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  form.setValue("email", "superadmin@example.com");
                  form.setValue("password", "password");
                }}
              >
                Super Admin Demo
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}