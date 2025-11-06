'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface SendMessageFormProps {
  recipientId?: string;
  recipientName?: string;
  relatedJobId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SendMessageForm({
  recipientId: initialRecipientId,
  recipientName: initialRecipientName,
  relatedJobId,
  onSuccess,
  onCancel,
}: SendMessageFormProps) {
  const [recipientId, setRecipientId] = useState(initialRecipientId || '');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch available recipients (admins for customers/contractors)
    // Note: In a real implementation, you'd fetch this from the API
    // For now, we'll just allow manual input or pre-selected recipient
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId || !content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await api.post<{ status: string; message: string; data: { message: any } }>('/messages', {
        recipientId,
        subject: subject || undefined,
        content,
        relatedJobId: relatedJobId || undefined,
      });

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });

      // Reset form
      setSubject('');
      setContent('');
      if (!initialRecipientId) {
        setRecipientId('');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to send message';
      
      // Show specific error for forbidden customer-contractor messaging
      if (errorMessage.includes('Direct messaging between customers and contractors') || errorMessage.includes('not allowed')) {
        toast({
          title: 'Messaging Restricted',
          description: 'Direct messaging between customers and contractors is not allowed. Please contact admin for assistance.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Message
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialRecipientId ? (
            <div className="space-y-2">
              <Label htmlFor="recipient">To (Admin)</Label>
              <Input
                id="recipient"
                placeholder="Contact admin for assistance"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {user?.role === 'CUSTOMER' 
                  ? 'Messages can only be sent to administrators'
                  : user?.role === 'CONTRACTOR'
                  ? 'Messages can only be sent to administrators'
                  : 'As an admin, you can message customers and contractors'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={initialRecipientName || 'Recipient'} disabled className="bg-muted" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              required
            />
          </div>

          {relatedJobId && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
              This message is related to a job
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading || !recipientId}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

