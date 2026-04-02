import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Search,
  CreditCard,
  Phone,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Briefcase,
} from "lucide-react"

export default function HowItWorksContractors() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              How It Works for Contractors
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Find new customers, grow your business, and build your reputation
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TrustBuild connects verified contractors with customers who need their skills. Create your profile, browse jobs that match your expertise, and contact customers directly to win the work.
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
                    Create Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Sign up and build your professional profile. Add your business details, services, years of experience, and portfolio photos to stand out to potential customers.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Showcase your skills, specialities, and past work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Upload portfolio images to demonstrate quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Verify your identity to gain customer trust</span>
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
                    Subscribe &amp; Browse Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Subscribe to access the full job feed. Browse jobs in your area that match your skills and select the ones that interest you. As a subscriber, you get 3 free job credits every week.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">3 free job credits included every week with your subscription</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Filter jobs by location, service type, and budget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Purchase extra job credits if you need more access</span>
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
                    Purchase Access &amp; Contact the Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    When you find a job you want, use a credit to unlock the customer&apos;s contact details. Call or message them directly to discuss the job, agree on a price, and win the work.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Instant access to customer phone number and email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Call the customer directly to discuss details and quote</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">No commission on the work you complete</span>
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
                    Complete the Job &amp; Build Your Reputation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-14 space-y-3">
                  <p className="text-muted-foreground">
                    Complete the job to a high standard, mark it as won on the platform, and ask the customer to leave a review. Good reviews build your profile and bring more customers over time.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Collect genuine customer reviews on the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Build your rating to rank higher in job listings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Top performers get featured status for maximum visibility</span>
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Contractors Choose TrustBuild</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Verified Job Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">All jobs on the platform are posted by real customers with genuine projects. No time wasted on cold leads or tyre-kickers.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Pay Per Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Only pay for jobs you want to pursue. Use your weekly free credits or purchase extras — there&apos;s no ongoing obligation beyond your subscription.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                    Direct Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Contact customers directly — no third party, no quoting through the platform. Agree terms and price in a single phone call.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Build Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Collect verified customer reviews that build your reputation over time. A strong profile means more customers choose you first.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Featured Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Top-performing contractors earn featured status, placing your profile at the top of the platform and in front of the most customers.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Shield className="h-5 w-5 text-teal-600" />
                    Dispute Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Our platform includes dispute resolution support to protect both contractors and customers in the event of disagreements.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Overview */}
      <div className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe monthly, every 6 months, or annually. Every plan includes 3 free job credits per week and full access to the platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  View Pricing Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?role=contractor">
                  <User className="mr-2 h-4 w-4" />
                  Join as a Contractor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
