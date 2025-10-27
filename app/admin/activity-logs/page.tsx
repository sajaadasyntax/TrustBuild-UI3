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
import { 
  Loader2, 
  Download, 
  Filter, 
  Search, 
  Eye,
  Activity,
  User,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '@/lib/adminApi';

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  diff: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ActivityStats {
  totalActivities: number;
  totalLogins: number;
  activityByAction: Array<{
    action: string;
    _count: { action: number };
  }>;
  activityByAdmin: Array<{
    admin: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    count: number;
  }>;
}

export default function ActivityLogsPage() {
  const { admin: currentAdmin, loading: authLoading } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 50,
      };

      if (searchTerm) params.search = searchTerm;
      if (actionFilter !== 'all') params.action = actionFilter;
      if (entityTypeFilter !== 'all') params.entityType = entityTypeFilter;
      if (adminFilter !== 'all') params.adminId = adminFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getActivityLogs(params);
      setLogs(response.data?.logs || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, actionFilter, entityTypeFilter, adminFilter, startDate, endDate, toast]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getActivityStats(params);
      setStats(response.data || null);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity statistics',
        variant: 'destructive',
      });
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate, toast]);

  useEffect(() => {
    if (!authLoading && currentAdmin) {
      fetchLogs();
      fetchStats();
    }
  }, [authLoading, currentAdmin, fetchLogs, fetchStats]);

  const exportLogs = async () => {
    try {
      toast({
        title: 'Exporting',
        description: 'Preparing CSV export...',
      });

      // Get all logs for export (no pagination)
      const params: any = { limit: 10000 };
      if (searchTerm) params.search = searchTerm;
      if (actionFilter !== 'all') params.action = actionFilter;
      if (entityTypeFilter !== 'all') params.entityType = entityTypeFilter;
      if (adminFilter !== 'all') params.adminId = adminFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await adminApi.getActivityLogs(params);
      const logsData = response.data?.logs || [];

      // Create CSV content
      const headers = [
        'Date/Time', 'Admin', 'Role', 'Action', 'Entity Type', 'Entity ID',
        'Description', 'IP Address'
      ];

      const csvContent = [
        headers.join(','),
        ...logsData.map((log: ActivityLog) => [
          new Date(log.createdAt).toLocaleString(),
          `"${log.admin?.name || 'Unknown'}"`,
          log.admin?.role || '',
          log.action,
          log.entityType || '',
          log.entityId || '',
          `"${log.description || ''}"`,
          log.ipAddress || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${logsData.length} activity logs to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export activity logs',
        variant: 'destructive',
      });
    }
  };

  const viewLogDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailDialog(true);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create') || action.includes('approve')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('delete') || action.includes('reject')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor all admin actions and system activities
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground">
                All admin actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalLogins}</div>
              <p className="text-xs text-muted-foreground">
                Successful admin logins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Action</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-green-600">
                {stats.activityByAction[0]?.action || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activityByAction[0]?._count?.action || 0} times
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Active Admin</CardTitle>
              <User className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-purple-600">
                {stats.activityByAdmin[0]?.admin?.name || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.activityByAdmin[0]?.count || 0} actions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-2">
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="action" className="mb-2">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entityType" className="mb-2">Entity Type</Label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
                setActionFilter('all');
                setEntityTypeFilter('all');
                setAdminFilter('all');
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

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Detailed log of all admin actions with timestamps and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No activity logs found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => viewLogDetails(log)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                      {log.entityType && (
                        <Badge variant="outline">{log.entityType}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{log.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.admin?.name || 'Unknown Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                      {log.ipAddress && (
                        <span>{log.ipAddress}</span>
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

      {/* Log Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this admin action
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <Badge className={getActionBadgeColor(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Entity Type</Label>
                  <Badge variant="outline">{selectedLog.entityType || 'N/A'}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Admin</Label>
                <p className="text-sm font-medium">{selectedLog.admin?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{selectedLog.admin?.email}</p>
                <Badge variant="outline" className="mt-1">{selectedLog.admin?.role}</Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Timestamp</Label>
                <p className="text-sm">{format(new Date(selectedLog.createdAt), 'MMMM dd, yyyy HH:mm:ss')}</p>
              </div>

              {selectedLog.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.entityId && (
                <div>
                  <Label className="text-xs text-muted-foreground">Entity ID</Label>
                  <p className="text-sm font-mono">{selectedLog.entityId}</p>
                </div>
              )}

              {selectedLog.ipAddress && (
                <div>
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <p className="text-xs font-mono break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.diff && (
                <div>
                  <Label className="text-xs text-muted-foreground">Changes (Before → After)</Label>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mt-2">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.diff, null, 2)}
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

