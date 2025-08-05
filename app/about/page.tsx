import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Star, MapPin, Wrench, MessageCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          TrustBuild is a UK-based platform built to connect customers with trusted renovation and construction professionals. Whether you&apos;re upgrading a kitchen, painting a flat, or managing a full refurbishment, we help you find the right contractor with confidence.
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <div className="prose prose-lg mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Our mission is to simplify the hiring process and promote honest, high-quality workmanship through verified profiles, reviews, and transparent communication.
          </p>
          <p className="text-lg text-muted-foreground">
            We&apos;re proudly founded by people in the trade – for the trade.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Verified Professionals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All contractors go through our verification process to ensure they have proven experience and credentials.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Trust & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Safe and secure platform with payment protection and dispute resolution services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Quality Assurance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Comprehensive review system and quality checks to ensure you get the best service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Local Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find contractors based on your location who understand local requirements and regulations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Wrench className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Wide Range of Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              From kitchen renovations to full home makeovers, find specialists for any project.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Transparent Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Direct communication between customers and contractors with built-in messaging and project updates.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Our Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We&apos;re committed to building a community of trusted professionals and satisfied customers. 
              Our platform is designed to make finding and hiring contractors as simple and stress-free as possible.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 