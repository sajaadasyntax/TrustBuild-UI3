"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Award, Building, CheckCircle, Star, Wrench, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { contractorsApi, contentApi, handleApiError, Contractor } from "@/lib/api"

// Default content as fallback
const DEFAULT_CONTENT = {
  hero: {
    title: "Find Trusted Contractors For Your Next Project",
    subtitle: "TrustBuild connects you with verified professionals for all your construction and renovation needs.",
    ctaText: "Post a Job",
    ctaSecondaryText: "Join as a Contractor"
  },
  howItWorks: [
    {
      step: 1,
      title: "Post Your Project",
      description: "Describe your project, budget, and timeline, and we'll match you with the right professionals.",
      icon: "building"
    },
    {
      step: 2,
      title: "Compare Contractors",
      description: "Review profiles, ratings, and previous work to find the perfect match for your needs.",
      icon: "wrench"
    },
    {
      step: 3,
      title: "Get It Done",
      description: "Hire your chosen contractor and track progress every step of the way.",
      icon: "checkCircle"
    }
  ],
  stats: {
    projectsCompleted: "1000+",
    verifiedContractors: "500+",
    customerSatisfaction: "98%",
    averageRating: "4.8"
  }
}

export default function Home() {
  const [featuredContractors, setFeaturedContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedContractors()
    fetchContent()
  }, [])

  const fetchFeaturedContractors = async () => {
    try {
      setLoading(true)
      const response = await contractorsApi.getAll({
        featured: true,
        limit: 3,
        page: 1
      })
      setFeaturedContractors(response.data.contractors || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch featured contractors')
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      setContentLoading(true)
      const platformContent = await contentApi.getPlatformContent()
      setContent({
        hero: platformContent.hero || DEFAULT_CONTENT.hero,
        howItWorks: platformContent.howItWorks || DEFAULT_CONTENT.howItWorks,
        stats: platformContent.stats || DEFAULT_CONTENT.stats,
      })
    } catch (error) {
      console.error('Failed to load platform content, using defaults:', error)
      // Use default content on error
    } finally {
      setContentLoading(false)
    }
  }

  const getTierBadgeInfo = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PREMIUM':
        return { icon: Award, text: 'Premium', className: 'bg-primary text-white' }
      case 'VERIFIED':
        return { icon: CheckCircle, text: 'Verified', className: 'bg-accent text-accent-foreground' }
      default:
        return null
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section pt-32 pb-16 md:pt-40 md:pb-24 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 animate-fade-in">
              {content.hero.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 animate-slide-up" style={{ animationDelay: "200ms" }}>
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/post-job">{content.hero.ctaText}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 border-white">
                <Link href="/register?role=contractor">{content.hero.ctaSecondaryText}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="mb-3">How TrustBuild Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to find the perfect contractor for your project
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {content.howItWorks.map((step, index) => {
              const IconComponent = step.icon === 'building' ? Building : step.icon === 'wrench' ? Wrench : CheckCircle
              return (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl mb-2">{step.step}. {step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/how-it-works">
                Learn More About Our Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Contractors */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="mb-3">Featured Contractors</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Top-rated professionals ready to tackle your next project
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden shadow animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredContractors.map((contractor) => {
                const badgeInfo = getTierBadgeInfo(contractor.tier)
                const defaultImage = "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                
                return (
                  <div 
                    key={contractor.id} 
                    className={`bg-card rounded-lg overflow-hidden shadow contractor-card ${
                      contractor.tier?.toLowerCase() === "premium" 
                        ? "tier-premium" 
                        : contractor.tier?.toLowerCase() === "verified" 
                          ? "tier-verified" 
                          : "tier-standard"
                    }`}
                  >
                    <div className="relative h-48">
                      <Image
                        src={contractor.portfolio?.[0]?.imageUrl || defaultImage}
                        alt={contractor.businessName || contractor.user?.name || 'Contractor'}
                        fill
                        className="object-cover"
                      />
                      {badgeInfo && (
                        <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full flex items-center ${badgeInfo.className}`}>
                          <badgeInfo.icon className="h-3 w-3 mr-1" />
                          {badgeInfo.text}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold mb-1">
                        {contractor.businessName || contractor.user?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {contractor.servicesProvided || 'Professional Contractor'}
                      </p>
                      
                      <div className="flex items-center mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-accent stroke-accent" />
                          <span className="ml-1 text-sm font-medium">
                            {contractor.averageRating?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {contractor.reviewCount || 0} reviews
                        </span>
                      </div>
                      
                      <Button asChild className="w-full">
                        <Link href={`/contractors/${contractor.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link href="/contractors">
                View All Contractors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4">Why Choose TrustBuild?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We&apos;ve built a platform that ensures quality, trust, and reliability for all your construction needs.
              </p>
              
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Verified Contractors</h4>
                    <p className="text-muted-foreground">Every contractor is thoroughly vetted and verified before joining our platform.</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Secure Transactions</h4>
                    <p className="text-muted-foreground">Our platform ensures secure payment processing for all transactions.</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Honest Reviews</h4>
                    <p className="text-muted-foreground">Verified reviews from real customers help you make informed decisions.</p>
                  </div>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Dedicated Support</h4>
                    <p className="text-muted-foreground">Our team is available to assist you throughout your project journey.</p>
                  </div>
                </li>
              </ul>
              
              <Button asChild className="mt-8">
                <Link href="/post-job">Get Started Today</Link>
              </Button>
            </div>
            
            <div className="relative rounded-lg overflow-hidden shadow-xl h-96">
              <Image
                src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Construction workers reviewing plans"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="mb-3">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real reviews from customers who found their perfect contractor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg shadow review-card">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent stroke-accent" />
                  ))}
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                &quot;TrustBuild made finding a reliable contractor so easy. I was able to compare multiple quotes and choose the best fit for my kitchen renovation.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium text-primary">JD</span>
                </div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-muted-foreground">Kitchen Renovation</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-card rounded-lg shadow review-card">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent stroke-accent" />
                  ))}
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                &quot;As a contractor, TrustBuild has helped grow my business significantly. The platform connects me with serious clients looking for quality work.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium text-primary">MS</span>
                </div>
                <div>
                  <p className="font-medium">Mike Smith</p>
                  <p className="text-sm text-muted-foreground">Premier Builders</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-card rounded-lg shadow review-card">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent stroke-accent" />
                  ))}
                  <Star className="h-4 w-4 fill-none stroke-accent" />
                </div>
              </div>
              <p className="italic text-muted-foreground mb-4">
                &quot;I was skeptical at first, but TrustBuild delivered beyond my expectations. The bathroom remodel was completed on time and within budget.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium text-primary">RJ</span>
                </div>
                <div>
                  <p className="font-medium">Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">Bathroom Remodel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-4">Ready to Start Your Project?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Join thousands of homeowners who found the perfect contractor through TrustBuild.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link href="/post-job">Post a Job</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-primary-foreground/10">
                <Link href="/register?role=contractor">Join as a Contractor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">5K+</p>
              <p className="text-muted-foreground">Verified Contractors</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</p>
              <p className="text-muted-foreground">Completed Projects</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">4.8</p>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-2">20K+</p>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}