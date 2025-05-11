"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRole } from "@prisma/client"

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["CUSTOMER", "CONTRACTOR"]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

const contractorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  businessName: z.string().min(2, "Business name is required"),
  role: z.enum(["CUSTOMER", "CONTRACTOR"]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  
  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
    },
  })
  
  const contractorForm = useForm<z.infer<typeof contractorSchema>>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      role: "CONTRACTOR",
    },
  })

  const onCustomerSubmit = async (data: z.infer<typeof customerSchema>) => {
    try {
      // In a real app, send this data to your API endpoint to create a user
      console.log("Customer form submitted:", data)
      router.push("/dashboard/client")
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  const onContractorSubmit = async (data: z.infer<typeof contractorSchema>) => {
    try {
      // In a real app, send this data to your API endpoint to create a user and contractor profile
      console.log("Contractor form submitted:", data)
      router.push("/dashboard/contractor")
    } catch (error) {
      console.error("Registration error:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-32">
      <Card className="mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Choose how you want to use TrustBuild
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="contractor" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Contractor
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Full Name</Label>
                    <Input 
                      id="customer-name" 
                      placeholder="John Doe"
                      {...customerForm.register("name")}
                    />
                    {customerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{customerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input 
                      id="customer-email" 
                      type="email" 
                      placeholder="john@example.com"
                      {...customerForm.register("email")}
                    />
                    {customerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{customerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <Input 
                      id="customer-password" 
                      type="password"
                      {...customerForm.register("password")}
                    />
                    {customerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{customerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-confirm-password">Confirm Password</Label>
                    <Input 
                      id="customer-confirm-password" 
                      type="password"
                      {...customerForm.register("confirmPassword")}
                    />
                    {customerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{customerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full">Create Customer Account</Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="contractor">
              <form onSubmit={contractorForm.handleSubmit(onContractorSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractor-name">Full Name</Label>
                    <Input 
                      id="contractor-name" 
                      placeholder="John Doe"
                      {...contractorForm.register("name")}
                    />
                    {contractorForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{contractorForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input 
                      id="business-name" 
                      placeholder="ABC Construction"
                      {...contractorForm.register("businessName")}
                    />
                    {contractorForm.formState.errors.businessName && (
                      <p className="text-sm text-destructive">{contractorForm.formState.errors.businessName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractor-email">Email</Label>
                    <Input 
                      id="contractor-email" 
                      type="email" 
                      placeholder="john@example.com"
                      {...contractorForm.register("email")}
                    />
                    {contractorForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{contractorForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractor-password">Password</Label>
                    <Input 
                      id="contractor-password" 
                      type="password"
                      {...contractorForm.register("password")}
                    />
                    {contractorForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{contractorForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractor-confirm-password">Confirm Password</Label>
                    <Input 
                      id="contractor-confirm-password" 
                      type="password"
                      {...contractorForm.register("confirmPassword")}
                    />
                    {contractorForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{contractorForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full">Create Contractor Account</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}