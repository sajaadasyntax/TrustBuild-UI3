import { useEffect, useState } from 'react'
import { contractorsApi, Contractor, handleApiError } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          <Card key={contractor.id}>
            <CardHeader>
              <CardTitle>{contractor.businessName || contractor.user?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-muted-foreground">{contractor.city || 'City not specified'}</div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{contractor.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 