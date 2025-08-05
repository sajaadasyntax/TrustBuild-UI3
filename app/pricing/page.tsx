import { CheckCheck, CreditCard, Clock, Star, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the plan that suits your business
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {/* Monthly Plan */}
        <Card className="relative">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Monthly Plan</CardTitle>
            <div className="text-4xl font-bold">£40</div>
            <div className="text-muted-foreground">per month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Access to job leads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">3 free job credits every week</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Professional profile on the platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 6-Month Plan */}
        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">6-Month Plan</CardTitle>
            <div className="text-4xl font-bold">£180</div>
            <div className="text-muted-foreground">Save £60</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Access to job leads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">3 free job credits every week</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Professional profile on the platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Annual Plan */}
        <Card className="relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-green-600 text-white">Best Value</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Annual Plan</CardTitle>
            <div className="text-4xl font-bold">£300</div>
            <div className="text-muted-foreground">Save £180</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Access to job leads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">3 free job credits every week</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Professional profile on the platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-16">
        <p className="text-lg text-muted-foreground mb-8">
          You can also purchase extra job leads without a subscription. Only pay for the work that matters.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Transparent Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No hidden fees or surprise charges. You know exactly what you&apos;re paying for.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Weekly Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get 3 free job credits every week to access new opportunities without additional cost.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Build Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Build your online reputation with real customer reviews and verified work history.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Direct Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get direct access to serious customers looking for your specific skills and expertise.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Secure Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Safe and secure platform with payment protection and dispute resolution services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CheckCheck className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Control Your Work</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Control over which jobs you take. Review details and choose projects that fit your schedule.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 