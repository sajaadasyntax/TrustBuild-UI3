"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, ArrowRight, CheckCheck, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(30, "Description must be at least 30 characters"),
  budget: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Budget must be a positive number" }
  ),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  timeline: z.enum(["asap", "within_month", "within_3_months", "flexible"]),
  notes: z.string().max(500, "Notes must be at most 500 characters"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

type JobFormValues = z.infer<typeof formSchema>

export default function PostJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      address: "",
      city: "",
      postcode: "",
      timeline: "asap",
      notes: "",
      termsAccepted: false,
    },
  })

  const services = [
    { id: "general-construction", label: "General Construction" },
    { id: "kitchen-remodeling", label: "Kitchen Remodeling" },
    { id: "bathroom-remodeling", label: "Bathroom Remodeling" },
    { id: "home-extension", label: "Home Extension" },
    { id: "roofing", label: "Roofing" },
    { id: "flooring", label: "Flooring" },
    { id: "painting", label: "Painting" },
    { id: "electrical", label: "Electrical" },
    { id: "plumbing", label: "Plumbing" },
    { id: "landscaping", label: "Landscaping" },
  ]

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger(["title", "description", "budget"])
      if (isValid) setStep(2)
    } else if (step === 2) {
      const isValid = await form.trigger(["address", "city", "postcode"])
      if (isValid) setStep(3)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true)
    
    try {
      // In a real app, you would submit to your API
      console.log("Form submitted:", data)
      
      toast({
        title: "Success!",
        description: "Your job has been posted successfully.",
      })
      
      // Redirect to dashboard
      router.push("/dashboard/client")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem posting your job.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-32">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
        <p className="text-muted-foreground">
          Tell us about your project and we'll help you find the right contractor
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="w-full absolute top-1/2 h-1 -translate-y-1/2 bg-muted"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > 1 ? <CheckCheck className="h-5 w-5" /> : "1"}
            </div>
            <span className="text-sm mt-2">Project Details</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > 2 ? <CheckCheck className="h-5 w-5" /> : "2"}
            </div>
            <span className="text-sm mt-2">Location</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              3
            </div>
            <span className="text-sm mt-2">Preferences</span>
          </div>
        </div>
      </div>
      
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Kitchen Renovation in London"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  Project Description <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  id="description" 
                  rows={6}
                  placeholder="Provide details about your project, including scope, materials, timeline, etc."
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">
                  Budget (£) <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="budget" 
                  type="number"
                  placeholder="e.g., 5000"
                  {...form.register("budget")}
                />
                {form.formState.errors.budget && (
                  <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span>Project Location Details</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="address" 
                  placeholder="123 Main St"
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="city" 
                    placeholder="London"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postcode">
                    Postcode <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="postcode" 
                    placeholder="SW1A 1AA"
                    {...form.register("postcode")}
                  />
                  {form.formState.errors.postcode && (
                    <p className="text-sm text-destructive">{form.formState.errors.postcode.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Project Timeline</Label>
                <Select
                  value={form.getValues("timeline")}
                  onValueChange={(value) => form.setValue("timeline", value as "asap" | "within_month" | "within_3_months" | "flexible")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="within_month">Within a month</SelectItem>
                    <SelectItem value="within_3_months">Within 3 months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any additional information about your project..."
                  value={form.getValues("notes")}
                  onChange={(e) => form.setValue("notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Post Job"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}