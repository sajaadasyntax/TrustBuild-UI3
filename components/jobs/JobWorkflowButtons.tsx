'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface JobWorkflowButtonsProps {
  jobId: string;
  jobStatus: string;
  jobTitle: string;
  isContractor: boolean;
  isCustomer: boolean;
  isWonByMe?: boolean;
  finalAmount?: number;
  onUpdate: () => void;
}

export default function JobWorkflowButtons({
  jobId,
  jobStatus,
  jobTitle,
  isContractor,
  isCustomer,
  isWonByMe = false,
  finalAmount,
  onUpdate,
}: JobWorkflowButtonsProps) {
  const [showMarkWonDialog, setShowMarkWonDialog] = useState(false);
  const [showMarkCompletedDialog, setShowMarkCompletedDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [completionAmount, setCompletionAmount] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Contractor: Mark job as Won
  const handleMarkAsWon = async () => {
    try {
      setLoading(true);
      await api.patch(`/jobs/${jobId}/mark-won`, {});
      toast({
        title: 'Success',
        description: 'Job marked as won. Customer has been notified.',
      });
      setShowMarkWonDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error marking job as won:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to mark job as won';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Contractor: Mark job as Completed with amount
  const handleMarkAsCompleted = async () => {
    const amount = parseFloat(completionAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/jobs/${jobId}/mark-completed`, {
        finalAmount: amount,
      });
      toast({
        title: 'Success',
        description: 'Job marked as completed. Customer will be asked to confirm.',
      });
      setShowMarkCompletedDialog(false);
      setCompletionAmount('');
      onUpdate();
    } catch (error: any) {
      console.error('Error marking job as completed:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to mark job as completed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer: Confirm job completion
  const handleConfirmCompletion = async (confirmed: boolean) => {
    try {
      setLoading(true);
      await api.patch(`/jobs/${jobId}/confirm-job-completion`, {
        confirmed,
        feedback: confirmed ? feedback : feedback || 'Disputed',
      });
      
      if (confirmed) {
        toast({
          title: 'Success',
          description: 'Job completion confirmed. Commission has been applied.',
        });
      } else {
        toast({
          title: 'Job Disputed',
          description: 'The job has been marked as disputed. Admin will review.',
        });
      }
      
      setShowConfirmDialog(false);
      setFeedback('');
      onUpdate();
    } catch (error: any) {
      console.error('Error confirming completion:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to process confirmation';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Contractor Buttons */}
      {isContractor && isWonByMe && (
        <>
          {/* Mark as Won Button */}
          {(jobStatus === 'POSTED' || jobStatus === 'IN_PROGRESS') && (
            <>
              <Button
                onClick={() => setShowMarkWonDialog(true)}
                className="w-full"
                variant="default"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Mark as Won
              </Button>

              <Dialog open={showMarkWonDialog} onOpenChange={setShowMarkWonDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Job as Won</DialogTitle>
                    <DialogDescription>
                      This will notify the customer that you have won the job and will be completing
                      it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Job: <span className="font-semibold">{jobTitle}</span>
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMarkWonDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleMarkAsWon} disabled={loading}>
                      {loading ? 'Processing...' : 'Confirm'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Mark as Completed Button */}
          {(jobStatus === 'WON' || jobStatus === 'IN_PROGRESS') && (
            <>
              <Button
                onClick={() => setShowMarkCompletedDialog(true)}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>

              <Dialog open={showMarkCompletedDialog} onOpenChange={setShowMarkCompletedDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Job as Completed</DialogTitle>
                    <DialogDescription>
                      Enter the final amount for this job. The customer will be asked to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Final Amount (£)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter final amount..."
                        value={completionAmount}
                        onChange={(e) => setCompletionAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Commission will be automatically applied after customer confirmation.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowMarkCompletedDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleMarkAsCompleted} disabled={loading}>
                      {loading ? 'Processing...' : 'Mark as Completed'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}

      {/* Customer Buttons */}
      {isCustomer && jobStatus === 'COMPLETED' && finalAmount && (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Completion Confirmation Required
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  The contractor has marked this job as completed for £{finalAmount.toFixed(2)}.
                  Please confirm if this is correct and if the job has been completed satisfactorily.
                </p>
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  variant="default"
                  size="sm"
                >
                  Review & Confirm
                </Button>
              </div>
            </div>
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Job Completion</DialogTitle>
                <DialogDescription>
                  Please review the job completion and amount
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Job Title:</p>
                  <p className="font-semibold">{jobTitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">Final Amount:</p>
                  <p className="text-2xl font-bold">£{finalAmount.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Add any feedback about the job completion..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  By confirming, the commission will be automatically applied to the contractor's
                  account.
                </p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmCompletion(false)}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Processing...' : 'Dispute'}
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleConfirmCompletion(true)}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Processing...' : 'Confirm Completion'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

