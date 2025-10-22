'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Download,
  ExternalLink,
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
  const [activeTab, setActiveTab] = useState('not-verified'); // Changed to verified/not-verified
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Action dialog state
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const fetchKycs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch based on verified status instead of KYC status
      const endpoint = activeTab === 'verified' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/queue?status=APPROVED`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/queue?status=PENDING,SUBMITTED,REJECTED,OVERDUE,UNDER_REVIEW`;
      
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

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
  }, [activeTab]);

  useEffect(() => {
    fetchKycs();
  }, [fetchKycs]);

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
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
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
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="not-verified">
                <AlertCircle className="w-4 h-4 mr-2" />
                Not Verified
              </TabsTrigger>
              <TabsTrigger value="verified">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified
              </TabsTrigger>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
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

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>KYC Document Review</DialogTitle>
            <DialogDescription>
              Review the contractor's submitted verification documents
            </DialogDescription>
          </DialogHeader>

          {selectedKyc && (
            <div className="space-y-6">
              {/* Contractor Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Contractor Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedKyc.contractor.user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedKyc.contractor.user.email}
                  </div>
                  <div>
                    <span className="font-medium">Business:</span> {selectedKyc.contractor.businessName || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Company Number:</span> {selectedKyc.companyNumber || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedKyc.status)}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {selectedKyc.submittedAt ? new Date(selectedKyc.submittedAt).toLocaleDateString() : 'Not submitted'}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="font-semibold">Submitted Documents</h3>
                
                {/* ID Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Government ID Document</h4>
                    {selectedKyc.idDocPath ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <FileText className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Not provided
                      </Badge>
                    )}
                  </div>
                  {selectedKyc.idDocPath && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Document uploaded successfully</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedKyc.idDocPath}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedKyc.idDocPath}`;
                            link.download = `id-document-${selectedKyc.contractor.user.name}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Utility Bill */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Utility Bill</h4>
                    {selectedKyc.utilityDocPath ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <FileText className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Not provided
                      </Badge>
                    )}
                  </div>
                  {selectedKyc.utilityDocPath && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Document uploaded successfully</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedKyc.utilityDocPath}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedKyc.utilityDocPath}`;
                            link.download = `utility-bill-${selectedKyc.contractor.user.name}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedKyc.status === 'SUBMITTED' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewDialog(false);
                      setShowApproveDialog(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
