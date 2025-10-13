'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface KYCRecord {
  id: string;
  contractorId: string;
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'OVERDUE';
  idDocPath?: string;
  utilityDocPath?: string;
  companyNumber?: string;
  submittedAt?: string;
  dueBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  notes?: string;
  contractor?: {
    id: string;
    businessName?: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminKYCPage() {
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState<KYCRecord | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const fetchKYCRecords = async () => {
    try {
      const response = await fetch('/api/admin/kyc', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch KYC records');

      const data = await response.json();
      setKycRecords(data.data || []);
    } catch (error) {
      console.error('Error fetching KYC records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load KYC records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (kyc: KYCRecord, action: 'approve' | 'reject') => {
    setSelectedKYC(kyc);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedKYC || !reviewAction) return;

    setProcessing(true);
    try {
      const endpoint = reviewAction === 'approve' 
        ? `/api/admin/kyc/${selectedKYC.id}/approve`
        : `/api/admin/kyc/${selectedKYC.id}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ notes: reviewNotes }),
      });

      if (!response.ok) throw new Error(`Failed to ${reviewAction} KYC`);

      toast({
        title: 'Success',
        description: `KYC ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setReviewDialogOpen(false);
      fetchKYCRecords();
    } catch (error) {
      console.error(`Error ${reviewAction}ing KYC:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${reviewAction} KYC`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      PENDING: { variant: 'secondary', icon: Clock },
      SUBMITTED: { variant: 'default', icon: Clock },
      UNDER_REVIEW: { variant: 'default', icon: Eye },
      APPROVED: { variant: 'outline', icon: CheckCircle },
      REJECTED: { variant: 'destructive', icon: XCircle },
      OVERDUE: { variant: 'destructive', icon: AlertCircle },
    };

    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const viewDocument = (docPath: string) => {
    window.open(`/api/admin/kyc/documents/${docPath}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">KYC Review Queue</h1>
        <p className="text-muted-foreground">
          Review and approve contractor KYC submissions
        </p>
      </div>

      <div className="grid gap-4">
        {kycRecords.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No KYC submissions to review</p>
            </CardContent>
          </Card>
        ) : (
          kycRecords.map((kyc) => (
            <Card key={kyc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{kyc.contractor?.businessName || kyc.contractor?.user.name}</CardTitle>
                    <CardDescription>{kyc.contractor?.user.email}</CardDescription>
                  </div>
                  {getStatusBadge(kyc.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Company Number</p>
                      <p className="text-muted-foreground">{kyc.companyNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-muted-foreground">
                        {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'Not submitted'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Due By</p>
                      <p className="text-muted-foreground">
                        {kyc.dueBy ? new Date(kyc.dueBy).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Documents</p>
                      <div className="flex gap-2">
                        {kyc.idDocPath && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDocument(kyc.idDocPath!)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            ID
                          </Button>
                        )}
                        {kyc.utilityDocPath && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDocument(kyc.utilityDocPath!)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Utility
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {kyc.notes && (
                    <div>
                      <p className="font-medium text-sm mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{kyc.notes}</p>
                    </div>
                  )}

                  {kyc.status === 'SUBMITTED' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReview(kyc, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReview(kyc, 'reject')}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} KYC Submission
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'This will approve the contractor\'s KYC submission and activate their account.'
                : 'Provide a reason for rejecting this KYC submission.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes {reviewAction === 'reject' && '(Required)'}</Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Add optional notes...' : 'Explain why this submission is being rejected...'}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={processing || (reviewAction === 'reject' && !reviewNotes.trim())}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

