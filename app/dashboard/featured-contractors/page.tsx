'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Briefcase, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface FeaturedContractor {
  id: string;
  name: string;
  email: string;
  rating: number;
  completedJobs: number;
  specialties: string[];
  location: string;
  joinedDate: string;
  revenue: number;
  businessName?: string;
  avatarUrl?: string;
}

export default function FeaturedContractorsPage() {
  const [contractors, setContractors] = useState<FeaturedContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  useEffect(() => {
    fetchFeaturedContractors();
  }, []);

  const fetchFeaturedContractors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contractors/featured`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch featured contractors');

      const data = await response.json();
      setContractors(data.data || []);
    } catch (error) {
      console.error('Error fetching featured contractors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load featured contractors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Award className="h-10 w-10 text-yellow-500" />
          <h1 className="text-4xl font-bold">Featured Contractors</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Discover our top-rated, verified contractors trusted by thousands of customers
        </p>
      </div>

      {/* Benefits Banner */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-3">Why Choose Featured Contractors?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Verified & Trusted</p>
                <p className="text-sm text-muted-foreground">All featured contractors are fully verified</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Top Rated</p>
                <p className="text-sm text-muted-foreground">Minimum 4.7+ star rating from customers</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Proven Track Record</p>
                <p className="text-sm text-muted-foreground">50+ successfully completed jobs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((contractor) => (
          <Card key={contractor.id} className="hover:shadow-lg transition-shadow border-2 border-yellow-100">
            <CardHeader className="relative">
              <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-3 w-3 mr-1 fill-white" />
                Featured
              </Badge>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-yellow-200">
                  <AvatarImage src={contractor.avatarUrl || `https://avatar.vercel.sh/${contractor.name}`} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700">
                    {contractor.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{contractor.businessName || contractor.name}</CardTitle>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{contractor.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({contractor.completedJobs} jobs)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{contractor.location}</span>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(contractor.specialties) && contractor.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {Array.isArray(contractor.specialties) && contractor.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{contractor.specialties.length - 3} more
                    </Badge>
                  )}
                  {!Array.isArray(contractor.specialties) && (
                    <Badge variant="secondary" className="text-xs">
                      Various Services
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Completed Jobs</p>
                  <p className="text-lg font-semibold">{contractor.completedJobs}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Date(contractor.joinedDate).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/contractors/${contractor.id}`}>
                    View Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/contractors/${contractor.id}/contact`}>
                    Contact
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contractors.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Featured Contractors Yet</h3>
          <p className="text-muted-foreground">
            Check back soon to see our top-rated contractors!
          </p>
        </div>
      )}

      {/* Call to Action */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Need Help Finding a Contractor?</h3>
          <p className="text-muted-foreground mb-4">
            Post your job and get matched with qualified contractors in your area
          </p>
          <Button asChild size="lg">
            <Link href="/post-job">
              Post a Job
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

