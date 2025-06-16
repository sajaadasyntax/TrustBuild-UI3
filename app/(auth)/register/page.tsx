"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/ui/icons"
import { useToast } from "@/hooks/use-toast"
import { authApi, ApiError } from "@/lib/api"

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["CUSTOMER", "CONTRACTOR"]),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
})

const customerSchema = baseSchema.extend({
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
})

const contractorSchema = baseSchema.extend({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  businessAddress: z.string().min(5, "Business address is required"),
  city: z.string().min(2, "City is required"),
  postcode: z.string().min(5, "Postcode is required"),
  servicesProvided: z.string().min(10, "Please describe your services"),
  yearsExperience: z.string().min(1, "Years of experience is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type CustomerFormData = z.infer<typeof customerSchema>
type ContractorFormData = z.infer<typeof contractorSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"CUSTOMER" | "CONTRACTOR">("CUSTOMER")

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
      terms: false,
      phone: "",
      address: "",
      city: "",
      postcode: "",
    },
  })

  const contractorForm = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CONTRACTOR",
      terms: false,
      businessName: "",
      description: "",
      phone: "",
      businessAddress: "",
      city: "",
      postcode: "",
      servicesProvided: "",
      yearsExperience: "",
    },
  })

  async function onCustomerSubmit(data: CustomerFormData) {
    setIsLoading(true)

    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "CUSTOMER",
      })

      // The authApi.register already handles token storage
      toast({
        title: "Account created!",
        description: "Welcome to TrustBuild! You can now post jobs and hire contractors.",
      })

      router.push("/dashboard/client")
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function onContractorSubmit(data: ContractorFormData) {
    setIsLoading(true)

    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "CONTRACTOR",
      })

      // The authApi.register already handles token storage
      toast({
        title: "Account created!",
        description: "Welcome to TrustBuild! Your contractor profile is pending approval.",
      })

      router.push("/dashboard/contractor")
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Choose your account type and fill in your details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label>I want to:</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "CUSTOMER" | "CONTRACTOR")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CUSTOMER" id="customer" />
                <Label htmlFor="customer">Hire contractors for my projects</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONTRACTOR" id="contractor" />
                <Label htmlFor="contractor">Work as a contractor</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Customer Registration Form */}
          {role === "CUSTOMER" && (
            <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Full Name</Label>
                  <Input
                    id="customer-name"
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...customerForm.register("name")}
                  />
                  {customerForm.formState.errors.name && (
                    <p className="text-xs text-red-600">{customerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="john@example.com"
                    disabled={isLoading}
                    {...customerForm.register("email")}
                  />
                  {customerForm.formState.errors.email && (
                    <p className="text-xs text-red-600">{customerForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-password">Password</Label>
                  <Input
                    id="customer-password"
                    type="password"
                    disabled={isLoading}
                    {...customerForm.register("password")}
                  />
                  {customerForm.formState.errors.password && (
                    <p className="text-xs text-red-600">{customerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-confirm-password">Confirm Password</Label>
                  <Input
                    id="customer-confirm-password"
                    type="password"
                    disabled={isLoading}
                    {...customerForm.register("confirmPassword")}
                  />
                  {customerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-600">{customerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer-terms"
                  onCheckedChange={(checked) => customerForm.setValue("terms", checked as boolean)}
                />
                <Label htmlFor="customer-terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {customerForm.formState.errors.terms && (
                <p className="text-xs text-red-600">{customerForm.formState.errors.terms.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Create Customer Account
              </Button>
            </form>
          )}

          {/* Contractor Registration Form */}
          {role === "CONTRACTOR" && (
            <form onSubmit={contractorForm.handleSubmit(onContractorSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor-name">Your Name</Label>
                  <Input
                    id="contractor-name"
                    placeholder="John Smith"
                    disabled={isLoading}
                    {...contractorForm.register("name")}
                  />
                  {contractorForm.formState.errors.name && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-business">Business Name</Label>
                  <Input
                    id="contractor-business"
                    placeholder="Smith Construction Ltd"
                    disabled={isLoading}
                    {...contractorForm.register("businessName")}
                  />
                  {contractorForm.formState.errors.businessName && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.businessName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor-email">Email</Label>
                  <Input
                    id="contractor-email"
                    type="email"
                    placeholder="john@smithconstruction.com"
                    disabled={isLoading}
                    {...contractorForm.register("email")}
                  />
                  {contractorForm.formState.errors.email && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-phone">Phone</Label>
                  <Input
                    id="contractor-phone"
                    type="tel"
                    placeholder="+44 7123 456789"
                    disabled={isLoading}
                    {...contractorForm.register("phone")}
                  />
                  {contractorForm.formState.errors.phone && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor-password">Password</Label>
                  <Input
                    id="contractor-password"
                    type="password"
                    disabled={isLoading}
                    {...contractorForm.register("password")}
                  />
                  {contractorForm.formState.errors.password && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-confirm-password">Confirm Password</Label>
                  <Input
                    id="contractor-confirm-password"
                    type="password"
                    disabled={isLoading}
                    {...contractorForm.register("confirmPassword")}
                  />
                  {contractorForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-address">Business Address</Label>
                <Input
                  id="contractor-address"
                  placeholder="123 Business Street"
                  disabled={isLoading}
                  {...contractorForm.register("businessAddress")}
                />
                {contractorForm.formState.errors.businessAddress && (
                  <p className="text-xs text-red-600">{contractorForm.formState.errors.businessAddress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractor-city">City</Label>
                  <Input
                    id="contractor-city"
                    placeholder="London"
                    disabled={isLoading}
                    {...contractorForm.register("city")}
                  />
                  {contractorForm.formState.errors.city && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor-postcode">Postcode</Label>
                  <Input
                    id="contractor-postcode"
                    placeholder="SW1A 1AA"
                    disabled={isLoading}
                    {...contractorForm.register("postcode")}
                  />
                  {contractorForm.formState.errors.postcode && (
                    <p className="text-xs text-red-600">{contractorForm.formState.errors.postcode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-services">Services Provided</Label>
                <Textarea
                  id="contractor-services"
                  placeholder="Describe the services you offer (e.g., Kitchen renovations, bathroom installations, general construction...)"
                  disabled={isLoading}
                  {...contractorForm.register("servicesProvided")}
                />
                {contractorForm.formState.errors.servicesProvided && (
                  <p className="text-xs text-red-600">{contractorForm.formState.errors.servicesProvided.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-experience">Years of Experience</Label>
                <Input
                  id="contractor-experience"
                  placeholder="e.g., 5 years"
                  disabled={isLoading}
                  {...contractorForm.register("yearsExperience")}
                />
                {contractorForm.formState.errors.yearsExperience && (
                  <p className="text-xs text-red-600">{contractorForm.formState.errors.yearsExperience.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contractor-terms"
                  onCheckedChange={(checked) => contractorForm.setValue("terms", checked as boolean)}
                />
                <Label htmlFor="contractor-terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {contractorForm.formState.errors.terms && (
                <p className="text-xs text-red-600">{contractorForm.formState.errors.terms.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Create Contractor Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="hover:text-brand underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}