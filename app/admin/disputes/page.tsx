"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, Search, Filter, Eye, MessageSquare } from 'lucide-react';

interface Dispute {
  id: string;
  jobId: string;
  raisedByUserId: string;
  raisedByRole: 'CUSTOMER' | 'CONTRACTOR';
  type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  evidenceUrls?: string[];
  resolution?: string;
  resolutionNotes?: string;
  creditRefunded: boolean;
  creditRefundAmount?: number;
  commissionAdjusted: boolean;
  commissionAmount?: number;
  jobCompletedOverride: boolean;
  createdAt: string;
  updatedAt: string;
  job: {
    title: string;
    customer: {
      user: { name: string; email: string };
    };
    wonByContractor?: {
      user: { name: string; email: string };
    };
    service: {
      name: string;
    };
    finalAmount?: number;
  };
  responses: any[];
}

interface DisputeStats {
  totalDisputes: number;
  openDisputes: number;
  resolvedDisputes: number;
  byType: any[];
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resolution form
  const [resolution, setResolution] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [refundCredits, setRefundCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState<number>(1);
  const [adjustCommission, setAdjustCommission] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [completeJob, setCompleteJob] = useState(false);

  useEffect(() => {
    fetchDisputes();
    fetchStats();
  }, [statusFilter, typeFilter, priorityFilter, searchQuery]);

  const fetchDisputes = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/disputes?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDisputes(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch disputes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch disputes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/stats`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = async (dispute: Dispute) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/${dispute.id}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedDispute(data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error('Error fetching dispute details:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution || !resolutionNotes) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/${selectedDispute.id}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            resolution,
            resolutionNotes,
            refundCredits,
            creditAmount: refundCredits ? creditAmount : undefined,
            adjustCommission,
            commissionAmount: adjustCommission ? commissionAmount : undefined,
            completeJob,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Dispute resolved successfully',
        });
        setShowResolveDialog(false);
        setShowDetailsDialog(false);
        resetResolveForm();
        fetchDisputes();
        fetchStats();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to resolve dispute',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve dispute',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (disputeId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/disputes/${disputeId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Status updated successfully',
        });
        fetchDisputes();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetResolveForm = () => {
    setResolution('');
    setResolutionNotes('');
    setRefundCredits(false);
    setCreditAmount(1);
    setAdjustCommission(false);
    setCommissionAmount(0);
    setCompleteJob(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      OPEN: { variant: 'destructive', icon: AlertTriangle },
      UNDER_REVIEW: { variant: 'default', icon: Clock },
      AWAITING_EVIDENCE: { variant: 'secondary', icon: MessageSquare },
      RESOLVED: { variant: 'default', icon: CheckCircle },
      CLOSED: { variant: 'outline', icon: CheckCircle },
    };

    const config = statusConfig[status] || { variant: 'default', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={priorityConfig[priority] || ''}>
        {priority}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, string> = {
      WORK_QUALITY: 'bg-purple-100 text-purple-800',
      JOB_CONFIRMATION: 'bg-blue-100 text-blue-800',
      CREDIT_REFUND: 'bg-green-100 text-green-800',
      PROJECT_DELAY: 'bg-yellow-100 text-yellow-800',
      PAYMENT_ISSUE: 'bg-red-100 text-red-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={typeConfig[type] || ''}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Disputes Management</h1>
        <p className="text-muted-foreground">Review and resolve customer/contractor disputes</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDisputes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.openDisputes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Disputes</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedDisputes}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="AWAITING_EVIDENCE">Awaiting Evidence</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="WORK_QUALITY">Work Quality</SelectItem>
                <SelectItem value="JOB_CONFIRMATION">Job Confirmation</SelectItem>
                <SelectItem value="CREDIT_REFUND">Credit Refund</SelectItem>
                <SelectItem value="PROJECT_DELAY">Project Delay</SelectItem>
                <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes ({disputes.length})</CardTitle>
          <CardDescription>All disputes submitted by customers and contractors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No disputes found
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dispute.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {dispute.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(dispute.type)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{dispute.job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {dispute.job.service.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {dispute.raisedByRole === 'CUSTOMER'
                            ? dispute.job.customer.user.name
                            : dispute.job.wonByContractor?.user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dispute.raisedByRole}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                    <TableCell>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(dispute)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              {/* Dispute Info */}
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="mt-1">{selectedDispute.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedDispute.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedDispute.type)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedDispute.priority)}</div>
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Job Information</h4>
                <div className="grid gap-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                    <p className="mt-1">{selectedDispute.job.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
                      <p className="mt-1">{selectedDispute.job.customer.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDispute.job.customer.user.email}
                      </p>
                    </div>
                    {selectedDispute.job.wonByContractor && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Contractor
                        </Label>
                        <p className="mt-1">{selectedDispute.job.wonByContractor.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDispute.job.wonByContractor.user.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence */}
              {selectedDispute.evidenceUrls && selectedDispute.evidenceUrls.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Evidence</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedDispute.evidenceUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Responses */}
              {selectedDispute.responses && selectedDispute.responses.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Responses ({selectedDispute.responses.length})</h4>
                  <div className="space-y-4">
                    {selectedDispute.responses.map((response: any) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-lg ${
                          response.isInternal
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            {response.userRole}
                            {response.isInternal && (
                              <Badge className="ml-2" variant="secondary">
                                Internal
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(response.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'CLOSED' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowResolveDialog(true);
                    }}
                    className="flex-1"
                  >
                    Resolve Dispute
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedDispute.id, 'UNDER_REVIEW')}
                  >
                    Mark Under Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose a resolution and provide detailed notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER_FAVOR">Customer Favor</SelectItem>
                  <SelectItem value="CONTRACTOR_FAVOR">Contractor Favor</SelectItem>
                  <SelectItem value="MUTUAL_AGREEMENT">Mutual Agreement</SelectItem>
                  <SelectItem value="CREDIT_REFUNDED">Credit Refunded</SelectItem>
                  <SelectItem value="COMMISSION_ADJUSTED">Commission Adjusted</SelectItem>
                  <SelectItem value="NO_ACTION">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Provide detailed notes about the resolution..."
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="refundCredits"
                  checked={refundCredits}
                  onCheckedChange={(checked) => setRefundCredits(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="refundCredits" className="cursor-pointer">
                    Refund Credits
                  </Label>
                  {refundCredits && (
                    <Input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(parseInt(e.target.value))}
                      min={1}
                      className="mt-2"
                      placeholder="Number of credits"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="adjustCommission"
                  checked={adjustCommission}
                  onCheckedChange={(checked) => setAdjustCommission(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="adjustCommission" className="cursor-pointer">
                    Adjust Commission
                  </Label>
                  {adjustCommission && (
                    <Input
                      type="number"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(parseFloat(e.target.value))}
                      min={0}
                      step={0.01}
                      className="mt-2"
                      placeholder="Commission amount (£)"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="completeJob"
                  checked={completeJob}
                  onCheckedChange={(checked) => setCompleteJob(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="completeJob" className="cursor-pointer">
                    Mark Job as Completed
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Override customer confirmation and mark job as completed
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve}>Resolve Dispute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

