import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Users,
  Phone,
  CheckCircle,
  Star,
  Shield,
  MessageCircle,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react"

export default function HowItWorksCustomers() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              How It Works for Customers
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Find and hire trusted contractors in four simple steps
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TrustBuild makes it easy to find verified, skilled contractors for any renovation or construction project. Post your job, receive interest from professionals, and choose the right person for the work.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-step Guide */}
      <div className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Your Step-by-Step Guide
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    Post Your Job — It&apos;s Free
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Describe your project in a few sentences. Include the type of work, your location, budget, and preferred timeline. Posting a job is completely free — no sign-up fee, no credit card required.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">No cost to post a job</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Quick and easy — takes less than 2 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Set your own budget and timeline</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    Receive Interest from Contractors
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Verified contractors in your area will see your job and express interest by purchasing access to contact you. You&apos;ll receive notifications when contractors are interested.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Only verified, approved contractors can respond</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Contractors come to you — no cold calling required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Review contractor profiles, ratings, and past work</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    Choose and Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Browse contractor profiles, check their reviews and portfolio, then communicate directly to agree on price and timelines. There&apos;s no middle man — you deal with the contractor directly.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Call or message contractors directly through the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Negotiate price and schedule that works for you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Review full work history and verified customer reviews</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      4
                    </div>
                    Rate Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Once your project is complete, leave an honest review to help other customers make informed decisions. Your feedback makes the community stronger.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Leave star ratings and written reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Help other customers find great contractors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Dispute resolution available if anything goes wrong</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/50 py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Customers Love TrustBuild</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    Verified Professionals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Every contractor on TrustBuild has been reviewed and verified. You only deal with professionals who meet our standards.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Free to Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Posting a job costs nothing. Contractors pay to access your contact details, so you never pay a fee to find help.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Real Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Read genuine reviews from customers who have worked with the contractor. All platform reviews are linked to a completed job.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Direct Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Speak directly with contractors — no middleman, no commission on the work itself. Agree on price and terms directly.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Fast Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Contractors actively browse for new jobs. Most jobs receive interest from professionals within hours of posting.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <MessageCircle className="h-5 w-5 text-teal-600" />
                    Dispute Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">If something goes wrong, our support team is here to help mediate and resolve issues between customers and contractors.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Post your job for free today and connect with trusted contractors in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/post-job">
                  Post a Job for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">
                  <Search className="mr-2 h-4 w-4" />
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
