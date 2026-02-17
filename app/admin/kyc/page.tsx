'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
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
  CalendarPlus,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface KycRecord {
  id: string;
  status: string;
  submittedAt: string | null;
  dueBy: string | null;
  idDocPath: string | null;
  utilityDocPath: string | null;
  insuranceDocPath: string | null;
  companyDocPath: string | null;
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

// Helper function to check admin permissions
function hasPermission(userPermissions: string[] | null | undefined, required: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(required);
}

export default function AdminKycPage() {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
  const permissions = admin?.permissions || [];
  const canApproveKyc = isSuperAdmin || hasPermission(permissions, 'kyc:approve');
  const canWriteKyc = isSuperAdmin || hasPermission(permissions, 'kyc:write');
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
  
  // Extend deadline dialog state
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extendDays, setExtendDays] = useState('14');
  const [extendReason, setExtendReason] = useState('');
  
  // Send reminder dialog state
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  // Helper function to normalize document path for URL construction
  // Converts absolute paths to relative paths and ensures proper encoding
  const normalizeDocumentPath = (docPath: string | null): string => {
    if (!docPath) return '';
    
    // If it's an absolute path, extract the relative part after /uploads/
    // Example: /var/www/.../uploads/kyc/contractorId/file.jpg -> kyc/contractorId/file.jpg
    const uploadsIndex = docPath.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      const relativePath = docPath.substring(uploadsIndex + '/uploads/'.length);
      // Remove leading slashes and normalize
      return relativePath.replace(/^\/+/, '').replace(/\\/g, '/');
    }
    
    // If it's already a relative path, just normalize it
    return docPath.replace(/^\/+/, '').replace(/\\/g, '/');
  };

  // Helper function to build document URL
  const buildDocumentUrl = (docPath: string | null): string => {
    if (!docPath) return '';
    const normalizedPath = normalizeDocumentPath(docPath);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';
    // Remove trailing /api if present, then add /api/admin/kyc/documents
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}/api/admin/kyc/documents/${encodeURIComponent(normalizedPath)}`;
  };

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

  const getDaysInfo = (dueBy: string | null) => {
    if (!dueBy) return null;
    const now = new Date();
    const due = new Date(dueBy);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExtendDeadline = async () => {
    if (!selectedKyc) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/${selectedKyc.id}/extend-deadline`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
          body: JSON.stringify({ days: parseInt(extendDays), reason: extendReason }),
        }
      );
      if (response.ok) {
        toast({ title: 'Deadline Extended', description: `Deadline extended by ${extendDays} days.` });
        setShowExtendDialog(false);
        setExtendDays('14');
        setExtendReason('');
        setSelectedKyc(null);
        fetchKycs();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to extend deadline');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedKyc) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/${selectedKyc.id}/send-reminder`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
          },
          body: JSON.stringify({ message: reminderMessage }),
        }
      );
      if (response.ok) {
        toast({ title: 'Reminder Sent', description: 'Verification reminder sent to contractor.' });
        setShowReminderDialog(false);
        setReminderMessage('');
        setSelectedKyc(null);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send reminder');
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
                      {kyc.dueBy ? (
                        <div>
                          <div>{new Date(kyc.dueBy).toLocaleDateString()}</div>
                          {(() => {
                            const days = getDaysInfo(kyc.dueBy);
                            if (days === null) return null;
                            if (days < 0) return (
                              <span className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                {Math.abs(days)} days overdue
                              </span>
                            );
                            if (days <= 3) return (
                              <span className="text-xs font-semibold text-orange-600 mt-0.5">
                                {days} days left
                              </span>
                            );
                            return (
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {days} days left
                              </span>
                            );
                          })()}
                        </div>
                      ) : <span className="text-gray-400">-</span>}
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
                        {kyc.status === 'SUBMITTED' && canApproveKyc && (
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
                        {kyc.status === 'SUBMITTED' && !canApproveKyc && (
                          <span className="text-sm text-muted-foreground">Review only</span>
                        )}
                        {/* Extend Deadline & Send Reminder - for non-approved records */}
                        {kyc.status !== 'APPROVED' && canWriteKyc && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowExtendDialog(true);
                              }}
                            >
                              <CalendarPlus className="w-4 h-4 mr-1" />
                              Extend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowReminderDialog(true);
                              }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Remind
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
                          onClick={() => window.open(buildDocumentUrl(selectedKyc.idDocPath), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = buildDocumentUrl(selectedKyc.idDocPath);
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
                    <h4 className="font-medium">Utility Bill (Proof of Address)</h4>
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
                          onClick={() => window.open(buildDocumentUrl(selectedKyc.utilityDocPath), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = buildDocumentUrl(selectedKyc.utilityDocPath);
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

                {/* Insurance Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Public Liability Insurance Certificate</h4>
                    {selectedKyc.insuranceDocPath ? (
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
                  {selectedKyc.insuranceDocPath && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Document uploaded successfully</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(buildDocumentUrl(selectedKyc.insuranceDocPath), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = buildDocumentUrl(selectedKyc.insuranceDocPath);
                            link.download = `insurance-certificate-${selectedKyc.contractor.user.name}.pdf`;
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

                {/* Company Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Company Registration Documents</h4>
                    {selectedKyc.companyDocPath ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <FileText className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 border-gray-500">
                        Optional
                      </Badge>
                    )}
                  </div>
                  {selectedKyc.companyDocPath && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Document uploaded successfully</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(buildDocumentUrl(selectedKyc.companyDocPath), '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = buildDocumentUrl(selectedKyc.companyDocPath);
                            link.download = `company-documents-${selectedKyc.contractor.user.name}.pdf`;
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

      {/* Extend Deadline Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Verification Deadline</DialogTitle>
            <DialogDescription>
              Extend the KYC submission deadline for this contractor. They will be notified by email and in-app notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedKyc && (
              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                <p><strong>Contractor:</strong> {selectedKyc.contractor.user.name}</p>
                <p><strong>Current deadline:</strong> {selectedKyc.dueBy ? new Date(selectedKyc.dueBy).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Status:</strong> {selectedKyc.status}</p>
              </div>
            )}
            <div>
              <Label htmlFor="extendDays">Extend by (days)</Label>
              <Input
                id="extendDays"
                type="number"
                min="1"
                max="90"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="extendReason">Reason (Optional)</Label>
              <Textarea
                id="extendReason"
                placeholder="Why is the deadline being extended?"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>Cancel</Button>
            <Button onClick={handleExtendDeadline} disabled={actionLoading || !extendDays}>
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarPlus className="w-4 h-4 mr-2" />}
              {actionLoading ? 'Extending...' : `Extend by ${extendDays} days`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Verification Reminder</DialogTitle>
            <DialogDescription>
              Send an email and in-app notification reminding this contractor to complete their verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedKyc && (
              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                <p><strong>Contractor:</strong> {selectedKyc.contractor.user.name}</p>
                <p><strong>Email:</strong> {selectedKyc.contractor.user.email}</p>
                <p><strong>Status:</strong> {selectedKyc.status}</p>
                {selectedKyc.dueBy && (() => {
                  const days = getDaysInfo(selectedKyc.dueBy);
                  if (days !== null && days < 0) return (
                    <p className="text-red-600 font-semibold">Overdue by {Math.abs(days)} days</p>
                  );
                  return days !== null ? <p>Due in {days} days</p> : null;
                })()}
              </div>
            )}
            <div>
              <Label htmlFor="reminderMessage">Custom Message (Optional)</Label>
              <Textarea
                id="reminderMessage"
                placeholder="Add a personal message to include in the reminder..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
            <Button onClick={handleSendReminder} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {actionLoading ? 'Sending...' : 'Send Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
