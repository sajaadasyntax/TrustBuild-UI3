'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { jobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { DollarSign, FileText, Clock } from 'lucide-react';

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string;
  jobTitle: string;
  jobBudget?: number;
}

export default function JobApplicationDialog({
  isOpen,
  onClose,
  onSuccess,
  jobId,
  jobTitle,
  jobBudget,
}: JobApplicationDialogProps) {
  const [proposal, setProposal] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [timeline, setTimeline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!proposal.trim()) {
      toast({
        title: 'Proposal Required',
        description: 'Please provide a cover letter/proposal for this job.',
        variant: 'destructive',
      });
      return;
    }

    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      toast({
        title: 'Quote Required',
        description: 'Please provide a valid quote amount.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await jobsApi.apply(jobId, {
        proposal: proposal.trim(),
        estimatedCost: parseFloat(estimatedCost),
        timeline: timeline.trim() || undefined,
      });

      toast({
        title: 'Application Submitted!',
        description: 'Your application has been sent to the customer.',
      });

      // Reset form
      setProposal('');
      setEstimatedCost('');
      setTimeline('');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to submit application';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for Job</DialogTitle>
          <DialogDescription>
            Submit your application for: <span className="font-semibold">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Budget Reference */}
          {jobBudget && jobBudget > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Customer Budget: £{jobBudget.toFixed(2)}</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This is the customer's budget. Provide your own quote based on your assessment.
              </p>
            </div>
          )}

          {/* Cover Letter / Proposal */}
          <div className="space-y-2">
            <Label htmlFor="proposal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cover Letter / Proposal <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="proposal"
              placeholder="Tell the customer why you're the right contractor for this job. Include your experience, approach, and any relevant details..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Explain your approach, experience, and why you're the best fit for this job.
            </p>
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Your Quote (£) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter your quote amount..."
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide your estimated cost for completing this job.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Timeline (Optional)
            </Label>
            <Input
              id="timeline"
              type="text"
              placeholder="e.g., 2-3 weeks, 1 month, etc."
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How long will it take you to complete this job?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !proposal.trim() || !estimatedCost}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

