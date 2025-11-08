'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminApi } from '@/lib/adminApi';
import { 
  Loader2, 
  Download, 
  Filter, 
  Search, 
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt: string;
  metadata?: {
    emailContent?: string;
    from?: string;
    messageId?: string;
    errorCode?: string;
    errorStatus?: number;
    [key: string]: any;
  };
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number;
  recentEmails: EmailLog[];
}

export default function EmailActivityPage() {
  const { admin: currentAdmin, loading: authLoading } = useAdminAuth();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  // Mock data for demonstration - replace with actual API calls
  const generateMockEmailLogs = (): EmailLog[] => {
    const types = ['password_reset', 'contractor_approval', 'kyc_update', 'payment_confirmation', 'dispute_notification', 'welcome_email'];
    const statuses: Array<'sent' | 'failed' | 'pending'> = ['sent', 'sent', 'sent', 'sent', 'failed'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `email-${i}`,
      recipient: `user${i}@example.com`,
      subject: `${types[i % types.length].replace('_', ' ').toUpperCase()} - Notification`,
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      error: statuses[i % statuses.length] === 'failed' ? 'SMTP connection timeout' : undefined,
      sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { userId: `user-${i}`, attempt: 1 }
    }));
  };

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getEmailLogs(params);
      setEmails(response.data?.logs || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email activity logs',
        variant: 'destructive',
      });
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, typeFilter, startDate, endDate, toast]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getEmailStats(params);
      setStats(response.data || null);
    } catch (error) {
      console.error('Error fetching email stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email statistics',
        variant: 'destructive',
      });
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => {
    if (!authLoading && currentAdmin) {
      fetchEmails();
      fetchStats();
    }
  }, [authLoading, currentAdmin, fetchEmails, fetchStats]);

  const exportEmails = async () => {
    try {
      toast({
        title: 'Exporting',
        description: 'Preparing CSV export...',
      });

      // Create CSV content
      const headers = ['Date/Time', 'Recipient', 'Subject', 'Type', 'Status', 'Error'];
      const csvContent = [
        headers.join(','),
        ...emails.map((email: EmailLog) => [
          new Date(email.sentAt).toLocaleString(),
          email.recipient,
          `"${email.subject}"`,
          email.type,
          email.status,
          email.error || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `email-activity-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${emails.length} email logs to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export email logs',
        variant: 'destructive',
      });
    }
  };

  const viewEmailDetails = (email: EmailLog) => {
    setSelectedEmail(email);
    setShowDetailDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!currentAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Activity Monitor</h1>
          <p className="text-muted-foreground">
            Track all system emails sent from the platform
          </p>
        </div>
        <Button onClick={exportEmails} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
              <p className="text-xs text-muted-foreground">
                Delivery failures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground">
                Queued for delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Email delivery success
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-2">
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search recipient or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="mb-2">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate" className="mb-2">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="mb-2">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Logs</CardTitle>
          <CardDescription>
            Detailed log of all system emails with delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No email logs found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => viewEmailDetails(email)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{email.recipient}</span>
                      {getStatusBadge(email.status)}
                      <Badge variant="outline" className="text-xs">{email.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{email.subject}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{format(new Date(email.sentAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                      {email.error && (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {email.error}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              Detailed information about this email delivery
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant="outline" className="mt-1">{selectedEmail.type}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Recipient</Label>
                <p className="text-sm font-medium">{selectedEmail.recipient}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="text-sm">{selectedEmail.subject}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Sent At</Label>
                <p className="text-sm">{format(new Date(selectedEmail.sentAt), 'MMMM dd, yyyy HH:mm:ss')}</p>
              </div>

              {selectedEmail.error && (
                <div>
                  <Label className="text-xs text-muted-foreground">Error Message</Label>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-600 dark:text-red-400">{selectedEmail.error}</p>
                  </div>
                </div>
              )}

              {selectedEmail.metadata?.emailContent && (
                <div>
                  <Label className="text-xs text-muted-foreground">Email Content</Label>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-2 max-h-96 overflow-y-auto border">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none [&_*]:text-sm [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.metadata.emailContent }}
                    />
                  </div>
                </div>
              )}

              {selectedEmail.metadata && Object.keys(selectedEmail.metadata).filter(key => key !== 'emailContent').length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Additional Metadata</Label>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(selectedEmail.metadata).filter(([key]) => key !== 'emailContent')
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

