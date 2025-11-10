'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface Setting {
  key: string;
  value: any;
  updatedAt: string;
  updatedBy?: string;
}

export default function AdminSettingsPage() {
  const { loading: authLoading } = useAdminAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';

  // Commission settings
  const [commissionRate, setCommissionRate] = useState('5.0');
  
  // Subscription pricing
  const [monthlyPrice, setMonthlyPrice] = useState('99');
  const [sixMonthPrice, setSixMonthPrice] = useState('499');
  const [yearlyPrice, setYearlyPrice] = useState('899');
  
  // Free job allocation
  const [freeJobAllocation, setFreeJobAllocation] = useState('1');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      
      // Backend returns data.settings as an object, not an array
      const settingsObject = data.data?.settings || {};
      
      // Convert object to array for state
      const settingsArray = Object.entries(settingsObject).map(([key, value]: [string, any]) => ({
        key,
        value: value.value,
        updatedAt: value.updatedAt,
        description: value.description
      }));
      
      setSettings(settingsArray);

      // Populate form fields with existing values
      if (settingsObject['COMMISSION_RATE']) {
        const commissionValue = settingsObject['COMMISSION_RATE'].value;
        setCommissionRate(commissionValue?.rate?.toString() || '5.0');
      }
      
      if (settingsObject['SUBSCRIPTION_PRICING']) {
        const pricingValue = settingsObject['SUBSCRIPTION_PRICING'].value;
        setMonthlyPrice(pricingValue?.monthly?.toString() || '99');
        setSixMonthPrice(pricingValue?.sixMonths?.toString() || '499');
        setYearlyPrice(pricingValue?.yearly?.toString() || '899');
      }
      
      if (settingsObject['FREE_JOB_ALLOCATION']) {
        const allocationValue = settingsObject['FREE_JOB_ALLOCATION'].value;
        setFreeJobAllocation(allocationValue?.defaultAllocation?.toString() || '1');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, API_BASE_URL]);

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [fetchSettings, authLoading]);

  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/settings/${key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCommissionRate = () => {
    updateSetting('COMMISSION_RATE', {
      rate: parseFloat(commissionRate),
      description: 'Platform commission rate percentage',
    });
  };

  const handleSaveSubscriptionPricing = () => {
    updateSetting('SUBSCRIPTION_PRICING', {
      monthly: parseFloat(monthlyPrice),
      sixMonths: parseFloat(sixMonthPrice),
      yearly: parseFloat(yearlyPrice),
      currency: 'GBP',
    });
  };

  const handleSaveFreeJobAllocation = () => {
    updateSetting('FREE_JOB_ALLOCATION', {
      defaultAllocation: parseInt(freeJobAllocation),
      description: 'Default free job leads for new contractors',
    });
  };

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
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings and parameters
        </p>
      </div>

      {/* Commission Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Rate</CardTitle>
          <CardDescription>
            Set the platform commission rate for completed jobs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="5.0"
            />
          </div>
          <Button onClick={handleSaveCommissionRate} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Commission Rate
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Pricing</CardTitle>
          <CardDescription>
            Configure subscription plan pricing in GBP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="monthlyPrice">Monthly (£)</Label>
              <Input
                id="monthlyPrice"
                type="number"
                step="1"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="99"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sixMonthPrice">6 Months (£)</Label>
              <Input
                id="sixMonthPrice"
                type="number"
                step="1"
                min="0"
                value={sixMonthPrice}
                onChange={(e) => setSixMonthPrice(e.target.value)}
                placeholder="499"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="yearlyPrice">Yearly (£)</Label>
              <Input
                id="yearlyPrice"
                type="number"
                step="1"
                min="0"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                placeholder="899"
              />
            </div>
          </div>
          <Button onClick={handleSaveSubscriptionPricing} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Subscription Pricing
          </Button>
        </CardContent>
      </Card>

      {/* Free Job Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Free Job Allocation</CardTitle>
          <CardDescription>
            Set the default number of free job leads for new contractors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="freeJobAllocation">Free Job Leads</Label>
            <Input
              id="freeJobAllocation"
              type="number"
              min="0"
              value={freeJobAllocation}
              onChange={(e) => setFreeJobAllocation(e.target.value)}
              placeholder="1"
            />
          </div>
          <Button onClick={handleSaveFreeJobAllocation} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Free Job Allocation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

