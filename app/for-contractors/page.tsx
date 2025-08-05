import { CheckCheck, Users, Star, CreditCard, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ForContractorsPage() {
  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Join as a Contractor</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Are you a skilled tradesperson or renovation expert? Join TrustBuild and gain access to local job opportunities tailored to your skills.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCheck className="h-5 w-5" />
            <span>Get matched with real customers</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCheck className="h-5 w-5" />
            <span>Build your online reputation</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCheck className="h-5 w-5" />
            <span>Flexible membership options</span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Sign up in minutes and start winning work today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Sign Up Now</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
            <CreditCard className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Transparent Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Transparent pricing with no hidden fees. Only pay for the work that matters.
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
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Grow Your Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Whether you&apos;re a sole trader or a growing team, TrustBuild connects you with the right projects.
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

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Why Join TrustBuild</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          TrustBuild is designed for professional contractors who want to grow their business and reach more clients without wasting time.
        </p>
        
        <Button asChild size="lg">
          <Link href="/register">Create Your Account</Link>
        </Button>
      </div>
    </div>
  )
} 