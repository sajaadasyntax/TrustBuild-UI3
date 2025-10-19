"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { faqApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  sortOrder: number
}

export default function FAQPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CONTRACTOR') {
        router.push('/dashboard/contractor')
      } else if (user.role === 'CUSTOMER') {
        router.push('/dashboard/client')
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin')
      }
    }
  }, [user, authLoading, router])

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true)
      const fetchedFaqs = await faqApi.getAllFaqs()
      setFaqs(fetchedFaqs)
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
      // Use default FAQs if fetch fails
      setFaqs([
        {
          id: '1',
          question: 'Is it free to post a job?',
          answer: 'Yes, posting a job is 100% free and there is no obligation to hire.',
          category: 'Job Posting',
          sortOrder: 1,
        },
        {
          id: '2',
          question: 'How do I know contractors are trustworthy?',
          answer: 'We verify contractor profiles, insurance, and collect customer reviews to ensure quality.',
          category: 'Verification',
          sortOrder: 2,
        },
        {
          id: '3',
          question: 'Can I contact multiple contractors?',
          answer: 'Yes, multiple contractors can express interest in your job, and you can choose the one that fits best.',
          category: 'General',
          sortOrder: 3,
        },
        {
          id: '4',
          question: 'What types of jobs can I post?',
          answer: 'Everything from kitchen renovations and painting to plumbing and full home makeovers.',
          category: 'Job Posting',
          sortOrder: 4,
        },
        {
          id: '5',
          question: 'How does the contractor verification process work?',
          answer: 'We verify contractor credentials, insurance, and collect customer reviews to ensure you\'re working with qualified professionals.',
          category: 'Verification',
          sortOrder: 5,
        },
        {
          id: '6',
          question: 'What if I\'m not satisfied with the work?',
          answer: 'We have a dispute resolution process and encourage open communication between customers and contractors to resolve any issues.',
          category: 'Support',
          sortOrder: 6,
        },
        {
          id: '7',
          question: 'How do payments work?',
          answer: 'Payments are handled directly between customers and contractors. We provide secure payment options and dispute resolution if needed.',
          category: 'Payments',
          sortOrder: 7,
        },
        {
          id: '8',
          question: 'Can contractors work in my area?',
          answer: 'Yes, we match you with contractors based on your location and their service areas to ensure they can work in your area.',
          category: 'General',
          sortOrder: 8,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render if redirecting
  if (user) {
    return null
  }

  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find answers to the most commonly asked questions about TrustBuild
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={faq.id} 
                value={`item-${index}`} 
                className="border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <div className="text-center mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <a 
              href="/contact" 
              className="text-primary hover:underline font-medium"
            >
              Contact Support →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
