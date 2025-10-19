'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface KycGuardProps {
  children: React.ReactNode;
}

/**
 * KYC Guard Component
 * Redirects contractors to KYC submission page if:
 * - Account is PAUSED (no KYC submitted)
 * - KYC is PENDING or REJECTED
 * - KYC is OVERDUE
 * 
 * Allows access if:
 * - User is not a contractor
 * - KYC is SUBMITTED/UNDER_REVIEW/APPROVED
 */
export function KycGuard({ children }: KycGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Only check contractors
    if (user.role !== 'CONTRACTOR') {
      setChecking(false);
      return;
    }

    // Check contractor status
    const checkKycStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/kyc/my-status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const kycStatus = data.data.kyc.status;

          // Redirect to KYC page if status requires submission
          const needsKycSubmission = ['PENDING', 'REJECTED', 'OVERDUE'].includes(kycStatus);
          
          if (needsKycSubmission) {
            // Don't redirect if already on KYC page
            if (!window.location.pathname.includes('/dashboard/kyc')) {
              router.push('/dashboard/kyc');
              return;
            }
          }
        }
        setChecking(false);
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setChecking(false);
      }
    };

    checkKycStatus();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}

