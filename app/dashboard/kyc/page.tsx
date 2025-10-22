'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Clock, FileText, Upload, Loader2 } from 'lucide-react';

interface KycData {
  id: string;
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'OVERDUE';
  dueBy: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  hasIdDocument: boolean;
  hasUtilityBill: boolean;
  companyNumber?: string;
}

export default function KycPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [utilityBill, setUtilityBill] = useState<File | null>(null);
  const [companyNumber, setCompanyNumber] = useState('');

  useEffect(() => {
    if (user?.role !== 'CONTRACTOR') {
      router.push('/dashboard');
      return;
    }
    fetchKycStatus();
  }, [user]);

  const fetchKycStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/my-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKyc(data.data.kyc);
      } else if (response.status === 404) {
        // KYC record doesn't exist yet - the backend should create it automatically
        // Retry after a short delay
        setTimeout(() => {
          fetchKycStatus();
        }, 1000);
      } else {
        setError('Failed to fetch KYC status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!idDocument || !utilityBill) {
      setError('Please upload both required documents');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('idDocument', idDocument);
      formData.append('utilityBill', utilityBill);
      if (companyNumber) {
        formData.append('companyNumber', companyNumber);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Documents uploaded successfully! Your account is now active pending admin review.');
        fetchKycStatus();
        // Clear form
        setIdDocument(null);
        setUtilityBill(null);
        setCompanyNumber('');
      } else {
        setError(data.message || 'Failed to upload documents');
      }
    } catch (err) {
      setError('Network error while uploading documents');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending Submission' },
      SUBMITTED: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', text: 'Under Review' },
      UNDER_REVIEW: { icon: Clock, color: 'bg-blue-100 text-blue-800', text: 'Under Review' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' },
      REJECTED: { icon: AlertCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' },
      OVERDUE: { icon: AlertCircle, color: 'bg-red-100 text-red-800', text: 'Overdue' },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    );
  };

  const getDaysRemaining = () => {
    if (!kyc?.dueBy) return null;
    const dueDate = new Date(kyc.dueBy);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="default" className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2">
              <p className="font-semibold">Setting up your KYC verification...</p>
              <p className="text-sm">This usually takes just a moment. If this persists, please refresh the page.</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isApproved = kyc.status === 'APPROVED';
  const needsSubmission = ['PENDING', 'REJECTED', 'OVERDUE'].includes(kyc.status);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-gray-600">
          Complete your KYC verification to access all contractor features
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Verification Status</h2>
            {getStatusBadge(kyc.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kyc.dueBy && !isApproved && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm">
                  <strong>Deadline:</strong> {new Date(kyc.dueBy).toLocaleDateString()}
                  {daysRemaining !== null && (
                    <span className={`ml-2 ${isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-gray-600'}`}>
                      ({isOverdue ? 'Overdue' : `${daysRemaining} days remaining`})
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {kyc.submittedAt && (
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm">
                  <strong>Submitted:</strong> {new Date(kyc.submittedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {kyc.reviewedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gray-500" />
                <span className="text-sm">
                  <strong>Reviewed:</strong> {new Date(kyc.reviewedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
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

      {/* Rejection Reason */}
      {kyc.rejectionReason && (
        <Alert className="mb-6 border-orange-300 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <strong className="text-orange-900">Rejection Reason:</strong>
            <p className="mt-1 text-orange-800">{kyc.rejectionReason}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Approved State */}
      {isApproved && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Verification Complete!</h3>
                <p className="text-green-700">
                  Your KYC verification has been approved. You have full access to all contractor features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {needsSubmission && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {kyc.status === 'REJECTED' ? 'Re-submit Documents' : 'Submit Verification Documents'}
            </h2>
            <p className="text-sm text-gray-600">
              Please upload the following documents to verify your identity
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Document */}
              <div>
                <Label htmlFor="idDocument" className="text-base font-medium">
                  Government-Issued ID *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Passport, driving license, or national ID card
                </p>
                <Input
                  id="idDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                  required
                />
              </div>

              {/* Utility Bill */}
              <div>
                <Label htmlFor="utilityBill" className="text-base font-medium">
                  Utility Bill *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Must be dated within the last 3 months
                </p>
                <Input
                  id="utilityBill"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUtilityBill(e.target.files?.[0] || null)}
                  required
                />
              </div>

              {/* Company Number */}
              <div>
                <Label htmlFor="companyNumber" className="text-base font-medium">
                  Company Registration Number
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  If applicable (optional)
                </p>
                <Input
                  id="companyNumber"
                  type="text"
                  placeholder="12345678"
                  value={companyNumber}
                  onChange={(e) => setCompanyNumber(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Documents
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                <strong>Note:</strong> Maximum file size is 10MB per document. Accepted formats: PDF, JPG, PNG
              </p>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

