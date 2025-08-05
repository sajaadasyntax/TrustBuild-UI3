import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">FAQ</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find answers to the most commonly asked questions about TrustBuild
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              Is it free to post a job?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, posting a job is 100% free and there is no obligation to hire.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              How do I know contractors are trustworthy?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We verify contractor profiles, insurance, and collect customer reviews to ensure quality.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              Can I contact multiple contractors?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, multiple contractors can express interest in your job, and you can choose the one that fits best.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              What types of jobs can I post?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Everything from kitchen renovations and painting to plumbing and full home makeovers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              How does the contractor verification process work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We verify contractor credentials, insurance, and collect customer reviews to ensure you&apos;re working with qualified professionals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              What if I&apos;m not satisfied with the work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We have a dispute resolution process and encourage open communication between customers and contractors to resolve any issues.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              How do payments work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Payments are handled directly between customers and contractors. We provide secure payment options and dispute resolution if needed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              Can contractors work in my area?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, we match you with contractors based on your location and their service areas to ensure they can work in your area.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

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