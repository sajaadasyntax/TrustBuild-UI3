'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { contractorsApi, Contractor, handleApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ContractorsDirectory() {
  const router = useRouter()
  const { user } = useAuth()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set())
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    // Block customers from browsing all contractors
    if (user && user.role === 'CUSTOMER') {
      setBlocked(true)
      setLoading(false)
      return
    }
    
    // Block contractors from seeing other contractors
    if (user && user.role === 'CONTRACTOR') {
      setBlocked(true)
      setLoading(false)
      return
    }
    
    // Only allow non-authenticated users or admins
    if (user === null) {
      fetchContractors()
    }
  }, [user]) // Removed router from dependencies

  const fetchContractors = async () => {
    try {
      setLoading(true)
      const response = await contractorsApi.getAll({ limit: 20 })
      setContractors(response.data.contractors || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch contractors')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container py-32 text-center">Loading contractors...</div>
  }

  if (blocked) {
    const isContractor = user?.role === 'CONTRACTOR'
    return (
      <div className="container py-32">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {isContractor 
                  ? "This page is not available for contractors. Please return to your dashboard to manage your jobs and profile."
                  : "This page is not available for clients. You can view contractors who apply to your posted jobs from your dashboard."
                }
              </AlertDescription>
            </Alert>
            <div className="flex justify-center space-x-4">
              <Link href={isContractor ? "/dashboard/contractor" : "/dashboard/client"}>
                <Button>Go to Dashboard</Button>
              </Link>
              {!isContractor && (
                <Link href="/post-job">
                  <Button variant="outline">Post a Job</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (contractors.length === 0) {
    return <div className="container py-32 text-center">No contractors found.</div>
  }

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-8">Find a Contractor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map(contractor => (
          <Card key={contractor.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {contractor.logoUrl && !logoErrors.has(contractor.id) ? (
                    <Image
                      src={contractor.logoUrl}
                      alt={`${contractor.businessName || contractor.user?.name} logo`}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                      onError={() => {
                        console.error('Failed to load logo for contractor:', contractor.id, contractor.logoUrl);
                        setLogoErrors(prev => new Set(prev).add(contractor.id));
                      }}
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {(contractor.businessName || contractor.user?.name || 'C').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle>{contractor.businessName || contractor.user?.name}</CardTitle>
                  {contractor.servicesProvided && (
                    <p className="text-sm text-muted-foreground">{contractor.servicesProvided}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 text-muted-foreground">{contractor.city || 'City not specified'}</div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (contractor.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span>{contractor.averageRating?.toFixed(1) || 'N/A'}</span>
                <span className="text-muted-foreground text-sm">({contractor.reviewCount || 0})</span>
              </div>
              <Link href={`/contractors/${contractor.id}`}>
                <Button className="w-full">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 