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
import { jobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface JobWorkflowButtonsProps {
  jobId: string;
  jobStatus: string;
  jobTitle: string;
  isContractor: boolean;
  isCustomer: boolean;
  isWonByMe?: boolean;
  finalAmount?: number;
  contractorProposedAmount?: number;
  hasApplied?: boolean;
  contractorName?: string;
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
  contractorProposedAmount,
  hasApplied = false,
  contractorName,
  onUpdate,
}: JobWorkflowButtonsProps) {
  const [showClaimWonDialog, setShowClaimWonDialog] = useState(false);
  const [showMarkCompletedDialog, setShowMarkCompletedDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirmWinnerDialog, setShowConfirmWinnerDialog] = useState(false);
  const [showPriceChangeDialog, setShowPriceChangeDialog] = useState(false);
  const [completionAmount, setCompletionAmount] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Contractor: Claim "I won the job" - sends notification but doesn't close job
  const handleClaimWon = async () => {
    try {
      setLoading(true);
      await jobsApi.claimWon(jobId);
      toast({
        title: 'Success',
        description: 'Customer has been notified. They will confirm if you won the job.',
      });
      setShowClaimWonDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error claiming job as won:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to claim job as won';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Contractor: Enter final agreed price & request completion
  const handleEnterFinalPrice = async () => {
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
      await jobsApi.markAsCompleted(jobId, amount);
      toast({
        title: 'Success',
        description: 'Final price submitted. Customer will be asked to confirm.',
      });
      setShowMarkCompletedDialog(false);
      setCompletionAmount('');
      onUpdate();
    } catch (error: any) {
      console.error('Error submitting final price:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to submit final price';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer: Confirm contractor winner
  const handleConfirmWinner = async () => {
    try {
      setLoading(true);
      await jobsApi.confirmWinner(jobId);
      toast({
        title: 'Success',
        description: 'Contractor confirmed. Job is now in progress and applications are closed.',
      });
      setShowConfirmWinnerDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error confirming winner:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to confirm winner';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer: Suggest price change
  const handleSuggestPriceChange = async () => {
    const amount = parseFloat(suggestedPrice);
    
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
      await jobsApi.suggestPriceChange(jobId, amount, feedback || 'Price change suggested');
      toast({
        title: 'Success',
        description: 'Price change suggestion sent to contractor.',
      });
      setShowPriceChangeDialog(false);
      setSuggestedPrice('');
      setFeedback('');
      onUpdate();
    } catch (error: any) {
      console.error('Error suggesting price change:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to suggest price change';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Customer: Confirm job completion and price
  const handleConfirmCompletion = async (action: 'confirm' | 'decline' | 'suggest') => {
    try {
      setLoading(true);
      
      if (action === 'confirm') {
        await jobsApi.confirmJobCompletionNew(jobId, true, feedback || 'Job completed successfully');
        toast({
          title: 'Success',
          description: 'Job completion confirmed. Commission has been applied.',
        });
      } else if (action === 'decline') {
        await jobsApi.confirmJobCompletionNew(jobId, false, feedback || 'Job completion declined');
        toast({
          title: 'Job Disputed',
          description: 'The job has been marked as disputed. Admin will review.',
        });
      } else if (action === 'suggest') {
        await handleSuggestPriceChange();
        return; // handleSuggestPriceChange already handles loading state
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
      {isContractor && (
        <>
          {/* Step 2: "I won the job" button - Available to any contractor who applied */}
          {hasApplied && jobStatus === 'POSTED' && !isWonByMe && (
            <>
              <Button
                onClick={() => setShowClaimWonDialog(true)}
                className="w-full"
                variant="default"
              >
                <Trophy className="h-4 w-4 mr-2" />
                I won the job
              </Button>

              <Dialog open={showClaimWonDialog} onOpenChange={setShowClaimWonDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Claim "I won the job"</DialogTitle>
                    <DialogDescription className="text-sm">
                      This will notify the customer that you claim to have won the job. 
                      The job will remain open until the customer confirms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Job: <span className="font-semibold">{jobTitle}</span>
                    </p>
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Note:</strong> The customer will receive a notification asking them to confirm. 
                        The job will stay open for other contractors until confirmation.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowClaimWonDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleClaimWon} disabled={loading}>
                      {loading ? 'Processing...' : 'Claim Job'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Step 4: Enter final agreed price & request completion - Only for confirmed winner */}
          {isWonByMe && jobStatus === 'IN_PROGRESS' && (
            <>
              <Button
                onClick={() => setShowMarkCompletedDialog(true)}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Enter final agreed price & request completion
              </Button>

              <Dialog open={showMarkCompletedDialog} onOpenChange={setShowMarkCompletedDialog}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Enter Final Agreed Price</DialogTitle>
                    <DialogDescription className="text-sm">
                      Enter the final amount you charged for this completed job. 
                      The customer will be asked to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Final Agreed Price (£)</Label>
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
                    <Button onClick={handleEnterFinalPrice} disabled={loading}>
                      {loading ? 'Processing...' : 'Submit Final Price'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      )}

      {/* Customer Buttons */}
      {/* Step 3: Customer confirms contractor winner */}
      {isCustomer && jobStatus === 'POSTED' && contractorName && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Contractor Claims They Won
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  {contractorName} claims that they won your job. Please confirm if this is correct.
                </p>
                <Button
                  onClick={() => setShowConfirmWinnerDialog(true)}
                  variant="default"
                  size="sm"
                >
                  Review & Confirm
                </Button>
              </div>
            </div>
          </div>

          <Dialog open={showConfirmWinnerDialog} onOpenChange={setShowConfirmWinnerDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Confirm Winning Contractor</DialogTitle>
                <DialogDescription className="text-sm">
                  Confirm if {contractorName} won your job. Once confirmed, the job will be in progress and applications will close.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Job Title:</p>
                  <p className="font-semibold">{jobTitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">Contractor:</p>
                  <p className="font-semibold">{contractorName}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  By confirming, the job will move to "In Progress" and no other contractors will be able to apply.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmWinnerDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmWinner}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Winner'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Step 5: Customer confirms price */}
      {isCustomer && jobStatus === 'AWAITING_FINAL_PRICE_CONFIRMATION' && contractorProposedAmount && (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Final Price Confirmation Required
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  The contractor has submitted a final price of £{contractorProposedAmount.toFixed(2)}. 
                  Please confirm, decline, or suggest a different amount.
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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Confirm Final Price</DialogTitle>
                <DialogDescription>
                  Review the contractor's proposed final price and choose an action
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Job Title:</p>
                  <p className="font-semibold">{jobTitle}</p>
                  <p className="text-sm text-muted-foreground mt-2">Proposed Final Price:</p>
                  <p className="text-2xl font-bold">£{contractorProposedAmount.toFixed(2)}</p>
                </div>
                
                <div className="space-y-3">
                  <p className="font-medium text-sm">What would you like to do?</p>
                  
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      className="w-full justify-start"
                      onClick={() => handleConfirmCompletion('confirm')}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm this price
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowPriceChangeDialog(true)}
                      disabled={loading}
                    >
                      Suggest a different price
                    </Button>
                    
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => handleConfirmCompletion('decline')}
                      disabled={loading}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Decline this price
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Add any comments..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Price Change Suggestion Dialog */}
          <Dialog open={showPriceChangeDialog} onOpenChange={setShowPriceChangeDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Suggest Price Change</DialogTitle>
                <DialogDescription className="text-sm">
                  Enter the amount you think is appropriate for this job
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="suggested-price">Suggested Price (£)</Label>
                  <Input
                    id="suggested-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter suggested amount..."
                    value={suggestedPrice}
                    onChange={(e) => setSuggestedPrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current proposed price: £{contractorProposedAmount.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-feedback">Reason (Optional)</Label>
                  <Textarea
                    id="price-feedback"
                    placeholder="Explain why you're suggesting this amount..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPriceChangeDialog(false);
                    setSuggestedPrice('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirmCompletion('suggest')}
                  disabled={loading || !suggestedPrice}
                >
                  {loading ? 'Processing...' : 'Submit Suggestion'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <DialogContent className="max-w-[95vw] sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Confirm Job Completion</DialogTitle>
                <DialogDescription className="text-sm">
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
                  onClick={() => handleConfirmCompletion('decline')}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Processing...' : 'Dispute'}
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleConfirmCompletion('confirm')}
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

