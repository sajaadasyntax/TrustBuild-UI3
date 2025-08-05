import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Clock, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Contact</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Have a question or need support? We&apos;re here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">support@trustbuild.uk</p>
            <p className="text-sm text-muted-foreground">
              Send us an email and we&apos;ll get back to you as soon as possible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">London, United Kingdom</p>
            <p className="text-sm text-muted-foreground">
              Our team is based in London, serving customers across the UK.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">24–48 hours</p>
            <p className="text-sm text-muted-foreground">
              We aim to respond to all inquiries within 24-48 hours.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              We Value Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We value your feedback – let us know how we can improve!
            </p>
            <a 
              href="mailto:support@trustbuild.uk" 
              className="text-primary hover:underline font-medium"
            >
              Send us a message →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 