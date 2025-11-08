'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminApi } from '@/lib/adminApi';
import { 
  Loader2, 
  Search, 
  Bell,
  User,
  Building2,
  Send,
  CheckCircle2,
  X,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  customer?: {
    id: string;
    phone?: string;
  };
  contractor?: {
    id: string;
    businessName?: string;
  };
}

export default function BroadcastNotificationPage() {
  const { admin, loading: authLoading } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('INFO');
  const [actionLink, setActionLink] = useState('');
  const [actionText, setActionText] = useState('');
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 500,
      };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await adminApi.getUsersForChat(params);
      setUsers(response.data?.users || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading, fetchUsers]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);
      const response = await adminApi.broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        userIds: selectedUsers,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        type: notificationType,
        actionLink: actionLink.trim() || undefined,
        actionText: actionText.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: `Notification sent to ${response.data?.sentCount || selectedUsers.length} user(s)`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setActionLink('');
      setActionText('');
      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send broadcast notification',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'CUSTOMER') {
      return <Badge variant="default">Customer</Badge>;
    } else if (role === 'CONTRACTOR') {
      return <Badge variant="secondary">Contractor</Badge>;
    }
    return null;
  };

  const filteredUsers = users.filter((user) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.contractor?.businessName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (authLoading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-32">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Broadcast Notification</h1>
          <p className="text-muted-foreground mt-2">
            Send notifications to selected customers or contractors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Details
              </CardTitle>
              <CardDescription>
                Create a notification to broadcast to selected users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Notification Type</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionLink">Action Link (Optional)</Label>
                <Input
                  id="actionLink"
                  placeholder="https://example.com/page"
                  value={actionLink}
                  onChange={(e) => setActionLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionText">Action Text (Optional)</Label>
                <Input
                  id="actionText"
                  placeholder="View Details"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Selected: {selectedUsers.length} user(s)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSendBroadcast}
                  disabled={!title.trim() || !message.trim() || selectedUsers.length === 0 || sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedUsers.length} User(s)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
              <CardDescription>
                Choose users to receive the notification
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 h-[calc(100vh-400px)]">
              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="CONTRACTOR">Contractors</option>
                </select>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedUsers.includes(user.id)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedUsers.includes(user.id) && (
                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        {user.role === 'CONTRACTOR' ? (
                          <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {user.contractor?.businessName || user.name}
                            </span>
                            {getRoleBadge(user.role)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

