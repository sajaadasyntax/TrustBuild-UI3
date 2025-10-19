'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface KycRecord {
  id: string;
  status: string;
  submittedAt: string | null;
  dueBy: string | null;
  idDocPath: string | null;
  utilityDocPath: string | null;
  companyNumber: string | null;
  contractor: {
    id: string;
    businessName: string | null;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminKycPage() {
  const router = useRouter();
  const [kycs, setKycs] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('SUBMITTED');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Action dialog state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    fetchKycs();
  }, [activeTab]);

  const fetchKycs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/queue?status=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKycs(data.data.kycRecords);
      } else {
        setError('Failed to fetch KYC records');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedKyc) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/${selectedKyc.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({ notes: approvalNotes }),
        }
      );

      if (response.ok) {
        setSuccess('KYC approved successfully');
        setShowApproveDialog(false);
        setApprovalNotes('');
        setSelectedKyc(null);
        fetchKycs();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to approve KYC');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKyc || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/${selectedKyc.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({
            reason: rejectionReason,
            notes: rejectionNotes,
          }),
        }
      );

      if (response.ok) {
        setSuccess('KYC rejected successfully');
        setShowRejectDialog(false);
        setRejectionReason('');
        setRejectionNotes('');
        setSelectedKyc(null);
        fetchKycs();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reject KYC');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      SUBMITTED: { variant: 'default', label: 'Submitted' },
      UNDER_REVIEW: { variant: 'default', label: 'Under Review' },
      APPROVED: { variant: 'success', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      OVERDUE: { variant: 'destructive', label: 'Overdue' },
    };

    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Verification Queue</h1>
        <p className="text-gray-600">Review and approve contractor verification documents</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-300 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="SUBMITTED">Pending Review</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : kycs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No KYC records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company #</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Due By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycs.map((kyc) => (
                  <TableRow key={kyc.id}>
                    <TableCell className="font-medium">
                      {kyc.contractor.user.name}
                    </TableCell>
                    <TableCell>
                      {kyc.contractor.businessName || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {kyc.contractor.user.email}
                    </TableCell>
                    <TableCell>
                      {kyc.companyNumber || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {kyc.submittedAt
                        ? new Date(kyc.submittedAt).toLocaleDateString()
                        : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {kyc.dueBy
                        ? new Date(kyc.dueBy).toLocaleDateString()
                        : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {kyc.status === 'SUBMITTED' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC Verification</DialogTitle>
            <DialogDescription>
              This will approve the contractor&apos;s KYC verification and fully activate their account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedKyc && (
              <div className="text-sm">
                <p><strong>Contractor:</strong> {selectedKyc.contractor.user.name}</p>
                <p><strong>Email:</strong> {selectedKyc.contractor.user.email}</p>
              </div>
            )}

            <div>
              <Label htmlFor="approvalNotes">Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes for the contractor..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve KYC
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              This will reject the contractor&apos;s KYC submission and pause their account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedKyc && (
              <div className="text-sm">
                <p><strong>Contractor:</strong> {selectedKyc.contractor.user.name}</p>
                <p><strong>Email:</strong> {selectedKyc.contractor.user.email}</p>
              </div>
            )}

            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why the documents are rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="rejectionNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="rejectionNotes"
                placeholder="Any additional information..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject KYC
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
