'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { contractorsApi, Contractor, handleApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export default function ContractorsDirectory() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContractors()
  }, [])

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
                  {contractor.logoUrl ? (
                    <Image
                      src={contractor.logoUrl}
                      alt={`${contractor.businessName || contractor.user?.name} logo`}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
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