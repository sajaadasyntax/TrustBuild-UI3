"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Star, Upload, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const reviewSchema = z.object({
  contractorId: z.string().min(1, "Please select a contractor"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  isExternal: z.boolean().default(false),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  projectDate: z.string().optional(),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

// Mock data - in a real app would come from API/database
const mockContractors = [
  { id: "1", name: "Smith & Sons Builders" },
  { id: "2", name: "Modern Interiors Ltd" },
  { id: "3", name: "Elite Home Solutions" },
]

const projectTypes = [
  "Kitchen Renovation",
  "Bathroom Remodeling",
  "Home Extension",
  "General Construction",
  "Electrical Work",
  "Plumbing",
  "Painting",
  "Flooring",
  "Other",
]

export default function CustomerReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [isExternal, setIsExternal] = useState(false)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      isExternal: false,
    },
  })

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true)
    
    try {
      // In a real app, this would submit to your API
      console.log("Review submitted:", data)
      
      toast({
        title: "Success!",
        description: "Your review has been submitted successfully.",
      })
      
      // Reset form
      form.reset()
      setSelectedRating(0)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your review.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-32">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
          <p className="text-muted-foreground">
            Share your experience with contractors to help others make informed decisions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Review</CardTitle>
            <CardDescription>
              {isExternal 
                ? "Add a review from a customer outside the platform"
                : "Write a review for a contractor you've worked with"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Review Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={!isExternal ? "default" : "outline"}
                    onClick={() => setIsExternal(false)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    In-App Review
                  </Button>
                  <Button
                    type="button"
                    variant={isExternal ? "default" : "outline"}
                    onClick={() => setIsExternal(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    External Review
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contractor</Label>
                <Select
                  onValueChange={(value) => form.setValue("contractorId", value)}
                  defaultValue={form.getValues("contractorId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContractors.map((contractor) => (
                      <SelectItem key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => {
                        setSelectedRating(rating)
                        form.setValue("rating", rating)
                      }}
                      className="p-1"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating <= selectedRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("projectType", value)}
                  defaultValue={form.getValues("projectType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isExternal && (
                <>
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input
                      {...form.register("customerName")}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Customer Email</Label>
                    <Input
                      {...form.register("customerEmail")}
                      type="email"
                      placeholder="Enter customer email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Date</Label>
                    <Input
                      {...form.register("projectDate")}
                      type="date"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Review</Label>
                <Textarea
                  {...form.register("comment")}
                  placeholder="Share your experience with this contractor..."
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 