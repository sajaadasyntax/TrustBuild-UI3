"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCheck, MapPin, Calendar, PoundSterling } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { servicesApi, jobsApi, handleApiError, Service } from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  budget: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Budget must be a positive number if provided"),
  serviceId: z.string().min(1, "Please select a service category"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  postcode: z.string().min(5, "Please enter a valid postcode"),
  urgency: z.enum(["low", "medium", "high"]),
  timeline: z.enum(["asap", "week", "month", "flexible"]),
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
})

type JobFormValues = z.infer<typeof formSchema>

export default function PostJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)

  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      serviceId: "",
      address: "",
      city: "",
      postcode: "",
      urgency: "medium",
      timeline: "flexible",
      notes: "",
      termsAccepted: false,
    },
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setServicesLoading(true)
      const response = await servicesApi.getAll({ isActive: true })
      const fetchedServices = response.data || []
      
      if (fetchedServices.length === 0) {
        // Use fallback services if no services in database
        setServices([
          { id: 'fallback-1', name: 'Bathroom Fitting', description: 'Complete bathroom installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-2', name: 'Bricklaying', description: 'Professional bricklaying and masonry work', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-3', name: 'Carpentry', description: 'Custom carpentry and woodworking services', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-4', name: 'Central Heating', description: 'Central heating installation and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-5', name: 'Conversions', description: 'Property conversions and structural alterations', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-6', name: 'Electrical', description: 'Electrical installation, repair and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-7', name: 'Flooring', description: 'Floor installation, repair and refinishing', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-8', name: 'Garden Landscaping', description: 'Garden design, landscaping and maintenance', category: 'Outdoor Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
          { id: 'fallback-9', name: 'Kitchen Fitting', description: 'Complete kitchen installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        ])
      } else {
        setServices(fetchedServices)
      }
    } catch (error) {
      console.warn('Services API failed, using fallback services')
      // Fallback to default services if API fails
      setServices([
        { id: 'fallback-1', name: 'Bathroom Fitting', description: 'Complete bathroom installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-2', name: 'Bricklaying', description: 'Professional bricklaying and masonry work', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-3', name: 'Carpentry', description: 'Custom carpentry and woodworking services', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-4', name: 'Central Heating', description: 'Central heating installation and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-5', name: 'Conversions', description: 'Property conversions and structural alterations', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-6', name: 'Electrical', description: 'Electrical installation, repair and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-7', name: 'Flooring', description: 'Floor installation, repair and refinishing', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-8', name: 'Garden Landscaping', description: 'Garden design, landscaping and maintenance', category: 'Outdoor Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
        { id: 'fallback-9', name: 'Kitchen Fitting', description: 'Complete kitchen installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
      ])
    } finally {
      setServicesLoading(false)
    }
  }

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger(["title", "description", "serviceId"])
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
      // Find the selected service to get its name for category
      const selectedService = services.find(service => service.id === data.serviceId)
      
      const jobData = {
        title: data.title,
        description: data.description,
        budget: data.budget ? parseFloat(data.budget) : undefined,
        serviceId: data.serviceId,
        category: selectedService?.name || 'General',
        location: `${data.address}, ${data.city}`,
        postcode: data.postcode,
        urgency: data.timeline, // Use timeline for urgency field in backend
        urgent: data.urgency === 'high', // Keep for backward compatibility
        timeline: data.timeline,
        requirements: data.notes,
      }

      const createdJob = await jobsApi.create(jobData)
      
      toast({
        title: "Success!",
        description: "Your job has been posted successfully.",
      })
      
      // Redirect to job details or dashboard
      router.push(`/dashboard/client/jobs/${createdJob.id}`)
    } catch (error) {
      handleApiError(error, "Failed to post job")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-32">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
        <p className="text-muted-foreground">
          Tell us about your project and we&apos;ll help you find the right contractor
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
                <Label htmlFor="serviceId">
                  Service Category <span className="text-destructive">*</span>
                </Label>
                {servicesLoading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                                      <Select 
                      value={form.watch("serviceId")} 
                      onValueChange={(value) => {
                        form.setValue("serviceId", value)
                        form.clearErrors("serviceId")
                      }}
                    >
                      <SelectTrigger className={form.watch("serviceId") ? "border-green-500" : ""}>
                        <SelectValue placeholder="Select a service category" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{service.name}</span>
                                {service.description && (
                                  <span className="text-xs text-muted-foreground">{service.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-services" disabled>
                            No services available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                )}
                {form.formState.errors.serviceId && (
                  <p className="text-sm text-destructive">{form.formState.errors.serviceId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">
                  Budget (£) <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input 
                  id="budget" 
                  type="number"
                  placeholder="e.g., 5000 - Leave blank if you prefer quotes"
                  {...form.register("budget")}
                />
                {form.formState.errors.budget && (
                  <p className="text-sm text-destructive">{form.formState.errors.budget.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave blank if you&apos;d prefer contractors to provide quotes instead of a fixed budget.
                </p>
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
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <Calendar className="h-5 w-5" />
                <span>Project Preferences</span>
              </div>
              
              <div className="space-y-2">
                <Label>Urgency</Label>
                <RadioGroup 
                  defaultValue="medium" 
                  onValueChange={(value) => form.setValue("urgency", value as "low" | "medium" | "high")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low - No rush</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium - Within a month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High - ASAP</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Timeline Preference</Label>
                <RadioGroup 
                  defaultValue="flexible" 
                  onValueChange={(value) => form.setValue("timeline", value as "asap" | "week" | "month" | "flexible")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asap" id="asap" />
                    <Label htmlFor="asap">Start immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="week" />
                    <Label htmlFor="week">Within a week</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" />
                    <Label htmlFor="month">Within a month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible">I&apos;m flexible</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  rows={4}
                  placeholder="Any additional information, requirements, or questions for contractors..."
                  {...form.register("notes")}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </a>
                </Label>
              </div>
              {form.formState.errors.termsAccepted && (
                <p className="text-sm text-destructive">{form.formState.errors.termsAccepted.message}</p>
              )}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Job"}
                <PoundSterling className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}