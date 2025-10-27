'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2, UserPlus, Trash2, Crown, Shield, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN';
  isActive: boolean;
  isMainSuperAdmin?: boolean;
  twoFAEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminManagementPage() {
  const { admin: currentAdmin, loading: authLoading } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const { toast } = useToast();

  // Create admin form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN'>('SUPPORT_ADMIN');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  useEffect(() => {
    if (!authLoading) {
      fetchAdmins();
    }
  }, [authLoading]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch admins');

      const data = await response.json();
      setAdmins(data.data?.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminName || !newAdminPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newAdminPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          password: newAdminPassword,
          role: newAdminRole,
          permissions: newAdminRole === 'SUPER_ADMIN' ? null : [], // Will be set based on role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      toast({
        title: 'Success',
        description: 'Admin created successfully',
      });

      setCreateDialogOpen(false);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPassword('');
      setNewAdminRole('SUPPORT_ADMIN');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/admins/${adminToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete admin');
      }

      toast({
        title: 'Success',
        description: 'Admin deleted successfully',
      });

      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete admin',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'FINANCE_ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'SUPPORT_ADMIN':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-3 w-3" />;
      case 'FINANCE_ADMIN':
        return <ShieldCheck className="h-3 w-3" />;
      case 'SUPPORT_ADMIN':
        return <ShieldCheck className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const canCreateSuperAdmin = currentAdmin?.isMainSuperAdmin === true;
  const isMainSuperAdmin = currentAdmin?.isMainSuperAdmin === true;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">
            Manage admin users and their roles
          </p>
        </div>
        {currentAdmin?.role === 'SUPER_ADMIN' && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@trustbuild.uk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newAdminRole} 
                    onValueChange={(value: any) => setNewAdminRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canCreateSuperAdmin && (
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      )}
                      <SelectItem value="FINANCE_ADMIN">Finance Admin</SelectItem>
                      <SelectItem value="SUPPORT_ADMIN">Support Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {newAdminRole === 'SUPER_ADMIN' && !canCreateSuperAdmin && (
                    <p className="text-xs text-destructive">
                      Only the Main Super Admin can create other Super Admins
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Admin
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            View and manage all administrator accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{admin.name}</h3>
                    {admin.isMainSuperAdmin && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Main Super Admin
                      </Badge>
                    )}
                    <Badge className={getRoleBadgeColor(admin.role)}>
                      {getRoleIcon(admin.role)}
                      <span className="ml-1">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </Badge>
                    {admin.twoFAEnabled && (
                      <Badge variant="outline">2FA Enabled</Badge>
                    )}
                    {!admin.isActive && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Created: {format(new Date(admin.createdAt), 'MMM dd, yyyy')}
                    </span>
                    {admin.lastLoginAt && (
                      <span>
                        Last login: {format(new Date(admin.lastLoginAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {admin.id !== currentAdmin?.id && !admin.isMainSuperAdmin && isMainSuperAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAdminToDelete(admin);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {admin.isMainSuperAdmin && (
                    <Badge variant="outline" className="text-xs">
                      Protected
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{adminToDelete?.name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

