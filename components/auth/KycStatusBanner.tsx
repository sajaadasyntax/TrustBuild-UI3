'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface KycStatus {
  status: string;
  dueBy: string | null;
  submittedAt: string | null;
}

export function KycStatusBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user?.role !== 'CONTRACTOR') return;

    const fetchKycStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/my-status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.data.kyc);
          
          // Show banner for specific statuses
          const showStatuses = ['PENDING', 'REJECTED', 'OVERDUE'];
          setShow(showStatuses.includes(data.data.kyc.status));
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error);
      }
    };

    fetchKycStatus();
  }, [user]);

  if (!show || !kycStatus) return null;

  const getBannerConfig = () => {
    switch (kycStatus.status) {
      case 'PENDING':
        const dueDate = kycStatus.dueBy ? new Date(kycStatus.dueBy) : null;
        const daysRemaining = dueDate 
          ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        return {
          icon: Clock,
          variant: daysRemaining && daysRemaining <= 3 ? 'destructive' : 'default',
          title: 'KYC Verification Required',
          description: daysRemaining
            ? `You have ${daysRemaining} days remaining to submit your verification documents. Submit now to avoid account suspension.`
            : 'Please submit your verification documents to activate your account.',
          buttonText: 'Submit Documents',
        };
      
      case 'REJECTED':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          title: 'KYC Documents Rejected',
          description: 'Your verification documents need to be resubmitted. Please check the rejection reason and upload corrected documents.',
          buttonText: 'Resubmit Documents',
        };
      
      case 'OVERDUE':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          title: 'Account Paused - KYC Overdue',
          description: 'Your KYC verification deadline has passed and your account has been paused. Submit your documents now to reactivate your account.',
          buttonText: 'Submit Now',
        };
      
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Alert className={`mb-6 ${config.variant === 'destructive' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <Icon className={`h-5 w-5 ${config.variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'}`} />
      <AlertDescription>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className={`font-semibold mb-1 ${config.variant === 'destructive' ? 'text-red-900' : 'text-yellow-900'}`}>
              {config.title}
            </h4>
            <p className={config.variant === 'destructive' ? 'text-red-800' : 'text-yellow-800'}>
              {config.description}
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/kyc')}
            variant={config.variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            className="whitespace-nowrap"
          >
            {config.buttonText}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

