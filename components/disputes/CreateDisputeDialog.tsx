"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Upload, X } from 'lucide-react';

interface CreateDisputeDialogProps {
  jobId: string;
  jobTitle: string;
  trigger?: React.ReactNode;
}

export function CreateDisputeDialog({ jobId, jobTitle, trigger }: CreateDisputeDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [type, setType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!type || !title || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);

      // Add files
      files.forEach((file) => {
        formData.append('evidence', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Dispute created successfully. Our team will review it shortly.',
        });
        setOpen(false);
        resetForm();
        // Optionally refresh the page or update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to create dispute',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dispute',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType('');
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Open Dispute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open a Dispute</DialogTitle>
          <DialogDescription>
            Report an issue with job: {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Dispute Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WORK_QUALITY">Work Quality Issue</SelectItem>
                <SelectItem value="JOB_CONFIRMATION">Job Confirmation / Commission Issue</SelectItem>
                <SelectItem value="CREDIT_REFUND">Credit Refund Request</SelectItem>
                <SelectItem value="PROJECT_DELAY">Project Delay</SelectItem>
                <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Dispute Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about the issue..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="evidence">Evidence (Photos, Documents)</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="evidence"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('evidence')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <span className="text-sm text-muted-foreground">
                  Max 10 files, 5MB each
                </span>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

