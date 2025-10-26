"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Dispute {
  id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  createdAt: string;
  job: {
    title: string;
    service: {
      name: string;
    };
  };
  responses: any[];
}

export default function ClientDisputesPage() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDisputes(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch disputes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch disputes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
      OPEN: { variant: 'destructive', icon: AlertTriangle, label: 'Open' },
      UNDER_REVIEW: { variant: 'default', icon: Clock, label: 'Under Review' },
      AWAITING_EVIDENCE: { variant: 'secondary', icon: MessageSquare, label: 'Awaiting Evidence' },
      RESOLVED: { variant: 'default', icon: CheckCircle, label: 'Resolved' },
      CLOSED: { variant: 'outline', icon: CheckCircle, label: 'Closed' },
    };

    const config = statusConfig[status] || { variant: 'default', icon: Clock, label: status };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      WORK_QUALITY: 'Work Quality',
      JOB_CONFIRMATION: 'Job Confirmation',
      CREDIT_REFUND: 'Credit Refund',
      PROJECT_DELAY: 'Project Delay',
      PAYMENT_ISSUE: 'Payment Issue',
      OTHER: 'Other',
    };

    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Disputes</h1>
        <p className="text-muted-foreground">View and manage your dispute cases</p>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No disputes found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't opened any disputes yet. If you have an issue with a job, you can open a dispute from the job details page.
            </p>
            <Button asChild>
              <Link href="/dashboard/client">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{dispute.title}</CardTitle>
                    <CardDescription>
                      Job: {dispute.job.title} ({dispute.job.service.name})
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(dispute.status)}
                    {getTypeBadge(dispute.type)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{dispute.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {dispute.responses?.length || 0} responses
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/client/disputes/${dispute.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

