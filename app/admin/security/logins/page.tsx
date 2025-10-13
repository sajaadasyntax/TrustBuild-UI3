'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Monitor, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginActivity {
  id: string;
  adminId: string;
  ip?: string;
  userAgent?: string;
  city?: string;
  country?: string;
  success: boolean;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  diff?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function SecurityLoginsPage() {
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logins' | 'activities'>('logins');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'logins') {
        const response = await fetch('/api/admin/logins', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch login activities');

        const data = await response.json();
        setLoginActivities(data.data || []);
      } else {
        const response = await fetch('/api/admin/activity', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch activity logs');

        const data = await response.json();
        setActivityLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `Failed to load ${activeTab === 'logins' ? 'login activities' : 'activity logs'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredLogins = loginActivities.filter((login) =>
    login.admin?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.admin?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.ip?.includes(searchTerm) ||
    login.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activityLogs.filter((log) =>
    log.admin?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Security & Activity Logs</h1>
        <p className="text-muted-foreground">
          Monitor admin login activities and system actions
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'logins'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Login Activities
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'activities'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Activity Logs
        </button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by admin, IP, location, or action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'logins' ? (
        <Card>
          <CardHeader>
            <CardTitle>Login Activities</CardTitle>
            <CardDescription>
              View all admin login attempts and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No login activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogins.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell>
                        {login.success ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{login.admin?.name}</p>
                          <p className="text-sm text-muted-foreground">{login.admin?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {login.city && login.country
                              ? `${login.city}, ${login.country}`
                              : login.country || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {login.ip || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Monitor className="h-4 w-4" />
                          <span className="truncate max-w-[200px]">
                            {login.userAgent?.split(' ')[0] || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(login.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              View all admin actions and system changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.admin?.name}</p>
                            <p className="text-xs text-muted-foreground">{log.admin?.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.entityType}</span>
                        {log.entityId && (
                          <p className="text-xs text-muted-foreground font-mono">{log.entityId.slice(0, 8)}...</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.description || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

