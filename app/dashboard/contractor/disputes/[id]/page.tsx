"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, CheckCircle, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface DisputeResponse {
  id: string;
  message: string;
  attachments: string[];
  createdAt: string;
  userRole: string;
}

interface Dispute {
  id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  job: {
    id: string;
    title: string;
    service: {
      name: string;
    };
  };
  responses: DisputeResponse[];
}

export default function ContractorDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDispute();
    }
  }, [params.id]);

  const fetchDispute = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDispute(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch dispute details',
          variant: 'destructive',
        });
        router.push('/dashboard/contractor/disputes');
      }
    } catch (error) {
      console.error('Error fetching dispute:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dispute details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('message', responseMessage);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${params.id}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Response added successfully',
        });
        setResponseMessage('');
        fetchDispute(); // Refresh dispute data
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add response',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: 'Error',
        description: 'Failed to add response',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      OPEN: { variant: 'destructive', icon: AlertTriangle, label: 'Open' },
      UNDER_REVIEW: { variant: 'default', icon: Clock, label: 'Under Review' },
      AWAITING_EVIDENCE: { variant: 'secondary', icon: MessageSquare, label: 'Awaiting Evidence' },
      RESOLVED: { variant: 'default', icon: CheckCircle, label: 'Resolved' },
      CLOSED: { variant: 'outline', icon: CheckCircle, label: 'Closed' },
    };

    const statusConfig = config[status] || { variant: 'default', icon: Clock, label: status };
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dispute not found</h3>
            <Button asChild>
              <Link href="/dashboard/contractor/disputes">Back to Disputes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/contractor/disputes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Disputes
          </Link>
        </Button>
      </div>

      {/* Dispute Details */}
      <Card>
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
              <Badge variant="outline">{dispute.type.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{dispute.description}</p>
          </div>

          {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Evidence</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dispute.evidenceUrls.map((url, index) => (
                  <a
                    key={index}
                    href={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border rounded p-2 hover:bg-muted"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {dispute.resolution && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-800">Resolution</h4>
              <p className="text-sm text-green-700 mb-2">{dispute.resolution.replace(/_/g, ' ')}</p>
              {dispute.resolutionNotes && (
                <p className="text-sm text-muted-foreground">{dispute.resolutionNotes}</p>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Created: {new Date(dispute.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Responses ({dispute.responses?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dispute.responses && dispute.responses.length > 0 ? (
            dispute.responses.map((response) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg ${
                  response.userRole === 'ADMIN'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={response.userRole === 'ADMIN' ? 'default' : 'secondary'}>
                    {response.userRole}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(response.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{response.message}</p>
                {response.attachments && response.attachments.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {response.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No responses yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Response */}
      {dispute.status !== 'CLOSED' && dispute.status !== 'RESOLVED' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
            />
            <Button onClick={handleSubmitResponse} disabled={submitting}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Sending...' : 'Send Response'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

