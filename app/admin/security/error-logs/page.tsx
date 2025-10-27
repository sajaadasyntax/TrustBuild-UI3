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
  AlertTriangle,
  XCircle,
  AlertCircle,
  Info,
  TrendingDown,
  Server
} from 'lucide-react';
import { format } from 'date-fns';

interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  stack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  metadata?: any;
  createdAt: string;
}

interface ErrorStats {
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  recentErrors: ErrorLog[];
  topErrorSources: Array<{ source: string; count: number }>;
}

export default function ErrorLogsPage() {
  const { admin: currentAdmin, loading: authLoading } = useAdminAuth();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  // Mock data for demonstration - replace with actual API calls
  const generateMockErrorLogs = (): ErrorLog[] => {
    const sources = ['webhook', 'payment_api', 'email_service', 'database', 'authentication', 'file_upload'];
    const levels: Array<'error' | 'warning' | 'info'> = ['error', 'error', 'warning', 'info'];
    const errors = [
      'Database connection timeout',
      'Webhook signature validation failed',
      'Payment processing error: Insufficient funds',
      'Email delivery failed: SMTP connection refused',
      'File upload size exceeds limit',
      'API rate limit exceeded',
      'Invalid JWT token',
      'External API timeout'
    ];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `error-${i}`,
      level: levels[i % levels.length],
      source: sources[i % sources.length],
      message: errors[i % errors.length],
      stack: levels[i % levels.length] === 'error' ? `Error: ${errors[i % errors.length]}\n    at Function.call (/app/routes/api.js:123)\n    at processRequest (/app/middleware/auth.js:45)` : undefined,
      endpoint: i % 3 === 0 ? `/api/webhooks/stripe` : `/api/payments/${i}`,
      method: ['POST', 'GET', 'PUT'][i % 3],
      statusCode: levels[i % levels.length] === 'error' ? 500 : levels[i % levels.length] === 'warning' ? 400 : 200,
      userId: i % 4 === 0 ? `user-${i}` : undefined,
      metadata: { requestId: `req-${i}`, ip: `192.168.1.${i % 255}` },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const fetchErrors = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (searchTerm) params.search = searchTerm;
      if (levelFilter !== 'all') params.level = levelFilter;
      if (sourceFilter !== 'all') params.source = sourceFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getErrorLogs(params);
      setErrors(response.data?.errors || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load error logs',
        variant: 'destructive',
      });
      setErrors([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, levelFilter, sourceFilter, startDate, endDate, toast]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getErrorStats(params);
      setStats(response.data || null);
    } catch (error) {
      console.error('Error fetching error stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load error statistics',
        variant: 'destructive',
      });
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => {
    if (!authLoading && currentAdmin) {
      fetchErrors();
      fetchStats();
    }
  }, [authLoading, currentAdmin, fetchErrors, fetchStats]);

  const exportErrors = async () => {
    try {
      toast({
        title: 'Exporting',
        description: 'Preparing CSV export...',
      });

      // Create CSV content
      const headers = ['Date/Time', 'Level', 'Source', 'Message', 'Endpoint', 'Method', 'Status Code', 'User ID'];
      const csvContent = [
        headers.join(','),
        ...errors.map((error: ErrorLog) => [
          new Date(error.createdAt).toLocaleString(),
          error.level,
          error.source,
          `"${error.message}"`,
          error.endpoint || '',
          error.method || '',
          error.statusCode || '',
          error.userId || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `error-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${errors.length} error logs to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export error logs',
        variant: 'destructive',
      });
    }
  };

  const viewErrorDetails = (error: ErrorLog) => {
    setSelectedError(error);
    setShowDetailDialog(true);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800"><Info className="h-3 w-3 mr-1" />Info</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
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
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground">
            Monitor system errors, API issues, and webhook failures
          </p>
        </div>
        <Button onClick={exportErrors} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                System errors logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalWarnings}</div>
              <p className="text-xs text-muted-foreground">
                Warning messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.criticalErrors}</div>
              <p className="text-xs text-muted-foreground">
                5XX server errors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Source</CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">{stats.topErrorSources[0]?.source || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {stats.topErrorSources[0]?.count || 0} errors
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
                  placeholder="Search message or source..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="level" className="mb-2">Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
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
                setLevelFilter('all');
                setSourceFilter('all');
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

      {/* Error Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Error Logs</CardTitle>
          <CardDescription>
            Detailed log of all system errors, warnings, and API issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No error logs found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => viewErrorDetails(error)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getLevelBadge(error.level)}
                      <Badge variant="outline" className="text-xs">{error.source}</Badge>
                      {error.statusCode && (
                        <Badge variant="outline" className="text-xs">{error.statusCode}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{error.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{format(new Date(error.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                      {error.endpoint && (
                        <span className="font-mono">{error.method} {error.endpoint}</span>
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

      {/* Error Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              Detailed information about this system error
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <div className="mt-1">{getLevelBadge(selectedError.level)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Source</Label>
                  <Badge variant="outline" className="mt-1">{selectedError.source}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Error Message</Label>
                <p className="text-sm font-medium mt-1">{selectedError.message}</p>
              </div>

              {selectedError.endpoint && (
                <div>
                  <Label className="text-xs text-muted-foreground">API Endpoint</Label>
                  <p className="text-sm font-mono mt-1">{selectedError.method} {selectedError.endpoint}</p>
                </div>
              )}

              {selectedError.statusCode && (
                <div>
                  <Label className="text-xs text-muted-foreground">Status Code</Label>
                  <Badge variant="outline" className="mt-1">{selectedError.statusCode}</Badge>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Timestamp</Label>
                <p className="text-sm mt-1">{format(new Date(selectedError.createdAt), 'MMMM dd, yyyy HH:mm:ss')}</p>
              </div>

              {selectedError.userId && (
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono mt-1">{selectedError.userId}</p>
                </div>
              )}

              {selectedError.stack && (
                <div>
                  <Label className="text-xs text-muted-foreground">Stack Trace</Label>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {selectedError.stack}
                    </pre>
                  </div>
                </div>
              )}

              {selectedError.metadata && (
                <div>
                  <Label className="text-xs text-muted-foreground">Metadata</Label>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
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

