"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  PoundSterling, 
  CreditCard, 
  Users, 
  Briefcase,
  Coins,
  Plus,
  Minus,
  Edit,
  Save,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { adminApi } from '@/lib/adminApi'
import { toast } from '@/hooks/use-toast'

interface Service {
  id: string
  name: string
  category: string
  description: string
  leadPrice: number
  estimatedDuration: string
  isActive: boolean
  smallJobPrice: number
  mediumJobPrice: number
  largeJobPrice: number
}

interface Contractor {
  id: string
  businessName: string
  credits: number
  subscriptionStatus: string
  tier: string
  creditsBalance: number
  weeklyCreditsLimit: number
  user: {
    name: string
    email: string
  }
}

interface CreditTransaction {
  id: string
  contractorId: string
  amount: number
  type: string
  description: string
  createdAt: string
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error)
  toast({
    title: "Error",
    description: error.message || defaultMessage,
    variant: "destructive",
  })
}

export default function AdminPricingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [pricingForm, setPricingForm] = useState({
    smallJobPrice: 0,
    mediumJobPrice: 0,
    largeJobPrice: 0
  })
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
    smallJobPrice: 0,
    mediumJobPrice: 0,
    largeJobPrice: 0
  })
  const [creditForm, setCreditForm] = useState({
    amount: '',
    reason: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubscription, setFilterSubscription] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [servicesData, contractorsData] = await Promise.all([
        adminApi.getAll(),
        adminApi.getAllContractors({ limit: 100 })
      ])
      
      setServices(servicesData.data.services || [])
      setContractors(contractorsData.data.contractors || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateServicePricing = async () => {
    if (!selectedService) return

    try {
      await adminApi.updateServicePricing(selectedService.id, pricingForm)
      
      toast({
        title: "Pricing Updated",
        description: `Lead prices updated for ${selectedService.name}`,
      })
      
      setShowPricingDialog(false)
      await fetchData()
    } catch (error) {
      handleApiError(error, 'Failed to update pricing')
    }
  }

  const handleUpdateService = async () => {
    if (!selectedService) return

    try {
      await adminApi.updateService(selectedService.id, serviceForm)
      
      toast({
        title: "Service Updated",
        description: `${serviceForm.name} has been updated successfully`,
      })
      
      setShowServiceDialog(false)
      await fetchData()
    } catch (error) {
      handleApiError(error, 'Failed to update service')
    }
  }

  const handleAdjustCredits = async (adjustmentType: 'add' | 'subtract' | 'set') => {
    if (!selectedContractor || !creditForm.reason) return

    try {
      let amount: number
      let type: 'ADDITION' | 'DEDUCTION'
      
      if (adjustmentType === 'set') {
        const targetAmount = parseInt(creditForm.amount) || 0
        const currentBalance = selectedContractor.creditsBalance || 0
        const difference = targetAmount - currentBalance
        
        if (difference === 0) {
          toast({
            title: "No Change",
            description: "The target amount is the same as the current balance",
          })
          return
        }
        
        amount = Math.abs(difference)
        type = difference > 0 ? 'ADDITION' : 'DEDUCTION'
      } else {
        amount = parseInt(creditForm.amount) || 1
        type = adjustmentType === 'add' ? 'ADDITION' : 'DEDUCTION'
      }
      
      await adminApi.adjustContractorCredits(selectedContractor.id, amount, creditForm.reason, type)

      toast({
        title: "Credits Adjusted",
        description: `${type === 'ADDITION' ? 'Added' : 'Removed'} ${amount} credits for ${selectedContractor.user.name}`,
      })
      
      setShowCreditDialog(false)
      setCreditForm({ amount: '', reason: '' })
      await fetchData()
    } catch (error) {
      handleApiError(error, 'Failed to adjust credits')
    }
  }

  const openPricingDialog = (service: Service) => {
    setSelectedService(service)
    setPricingForm({
      smallJobPrice: service.smallJobPrice,
      mediumJobPrice: service.mediumJobPrice,
      largeJobPrice: service.largeJobPrice
    })
    setShowPricingDialog(true)
  }

  const openServiceDialog = (service: Service) => {
    setSelectedService(service)
    setServiceForm({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      isActive: service.isActive,
      smallJobPrice: service.smallJobPrice,
      mediumJobPrice: service.mediumJobPrice,
      largeJobPrice: service.largeJobPrice
    })
    setShowServiceDialog(true)
  }

  const openCreditDialog = (contractor: Contractor) => {
    setSelectedContractor(contractor)
    setShowCreditDialog(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    const isSubscribed = contractor.weeklyCreditsLimit > 0 || contractor.subscriptionStatus === 'active'
    const matchesSubscription = filterSubscription === 'all' || 
                               (filterSubscription === 'subscribed' && isSubscribed) ||
                               (filterSubscription === 'not_subscribed' && !isSubscribed)
    return matchesSearch && matchesSubscription
  })

  if (loading) {
    return (
      <div className="container py-32">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-32">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pricing & Credits Management</h1>
          <p className="text-muted-foreground">
            Manage service lead pricing and contractor credit system
          </p>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">Service Pricing</TabsTrigger>
            <TabsTrigger value="credits">Credit Management</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Service Pricing Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Lead Pricing</CardTitle>
                <CardDescription>
                  Set lead access prices for different job sizes across all service categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openServiceDialog(service)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Service
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPricingDialog(service)}
                          >
                            <PoundSterling className="h-4 w-4 mr-2" />
                            Quick Pricing
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <Badge className="bg-green-100 text-green-800 mb-2">Small Jobs</Badge>
                          <p className="text-2xl font-bold">{formatCurrency(service.smallJobPrice)}</p>
                        </div>
                        <div className="text-center">
                          <Badge className="bg-yellow-100 text-yellow-800 mb-2">Medium Jobs</Badge>
                          <p className="text-2xl font-bold">{formatCurrency(service.mediumJobPrice)}</p>
                        </div>
                        <div className="text-center">
                          <Badge className="bg-red-100 text-red-800 mb-2">Large Jobs</Badge>
                          <p className="text-2xl font-bold">{formatCurrency(service.largeJobPrice)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credit Management Tab */}
          <TabsContent value="credits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Credits</CardTitle>
                <CardDescription>
                  Manage contractor credit balances and view transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search contractors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contractors</SelectItem>
                      <SelectItem value="subscribed">Subscribed</SelectItem>
                      <SelectItem value="not_subscribed">Not Subscribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Subscription Status</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Weekly Limit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContractors.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contractor.user.name}</p>
                            <p className="text-sm text-muted-foreground">{contractor.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{contractor.businessName || 'N/A'}</TableCell>
                        <TableCell>
                          {contractor.weeklyCreditsLimit > 0 || contractor.subscriptionStatus === 'active' ? (
                            <Badge variant="default" className="bg-green-500">Subscribed</Badge>
                          ) : (
                            <Badge variant="outline">Not Subscribed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{contractor.creditsBalance}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contractor.weeklyCreditsLimit}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCreditDialog(contractor)}
                          >
                            Adjust Credits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active service categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contractors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered contractors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits in Circulation</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contractors.reduce((sum, c) => sum + c.creditsBalance, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total contractor credits
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Average Lead Prices</CardTitle>
                <CardDescription>
                  Average pricing across all service categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 mb-2">Small Jobs</Badge>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        services.reduce((sum, s) => sum + s.smallJobPrice, 0) / services.length || 0
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-800 mb-2">Medium Jobs</Badge>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        services.reduce((sum, s) => sum + s.mediumJobPrice, 0) / services.length || 0
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-red-100 text-red-800 mb-2">Large Jobs</Badge>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        services.reduce((sum, s) => sum + s.largeJobPrice, 0) / services.length || 0
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pricing Dialog */}
        <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Lead Pricing</DialogTitle>
              <DialogDescription>
                Set lead access prices for {selectedService?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="smallPrice">Small Job Price</Label>
                <Input
                  id="smallPrice"
                  type="number"
                  step="0.01"
                  value={pricingForm.smallJobPrice}
                  onChange={(e) => setPricingForm(prev => ({ 
                    ...prev, 
                    smallJobPrice: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="mediumPrice">Medium Job Price</Label>
                <Input
                  id="mediumPrice"
                  type="number"
                  step="0.01"
                  value={pricingForm.mediumJobPrice}
                  onChange={(e) => setPricingForm(prev => ({ 
                    ...prev, 
                    mediumJobPrice: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="largePrice">Large Job Price</Label>
                <Input
                  id="largePrice"
                  type="number"
                  step="0.01"
                  value={pricingForm.largeJobPrice}
                  onChange={(e) => setPricingForm(prev => ({ 
                    ...prev, 
                    largeJobPrice: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              
              <Button onClick={handleUpdateServicePricing} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Full Service Edit Dialog */}
        <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update service details, category, and pricing
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Plumbing, Electrical, etc."
                />
              </div>

              <div>
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="serviceCategory">Category</Label>
                <Input
                  id="serviceCategory"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Trade Services, Home Improvement, etc."
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="serviceActive" className="text-base font-medium">
                    Service Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {serviceForm.isActive ? 'Active - visible to customers' : 'Inactive - hidden from customers'}
                  </p>
                </div>
                <Switch
                  id="serviceActive"
                  checked={serviceForm.isActive}
                  onCheckedChange={(checked) => setServiceForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Lead Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editSmallPrice">Small Job Price</Label>
                    <Input
                      id="editSmallPrice"
                      type="number"
                      step="0.01"
                      value={serviceForm.smallJobPrice}
                      onChange={(e) => setServiceForm(prev => ({ 
                        ...prev, 
                        smallJobPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editMediumPrice">Medium Job Price</Label>
                    <Input
                      id="editMediumPrice"
                      type="number"
                      step="0.01"
                      value={serviceForm.mediumJobPrice}
                      onChange={(e) => setServiceForm(prev => ({ 
                        ...prev, 
                        mediumJobPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editLargePrice">Large Job Price</Label>
                    <Input
                      id="editLargePrice"
                      type="number"
                      step="0.01"
                      value={serviceForm.largeJobPrice}
                      onChange={(e) => setServiceForm(prev => ({ 
                        ...prev, 
                        largeJobPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateService} 
                  className="flex-1"
                  disabled={!serviceForm.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowServiceDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Credit Adjustment Dialog */}
        <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Credits</DialogTitle>
              <DialogDescription>
                Adjust credit balance for {selectedContractor?.user.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Credit Amount</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(creditForm.amount) || 0
                      setCreditForm(prev => ({ ...prev, amount: Math.max(0, current - 1).toString() }))
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={creditForm.amount}
                    onChange={(e) => setCreditForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(creditForm.amount) || 0
                      setCreditForm(prev => ({ ...prev, amount: (current + 1).toString() }))
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current balance: {selectedContractor?.creditsBalance || 0} credits
                </p>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Reason for credit adjustment..."
                  value={creditForm.reason}
                  onChange={(e) => setCreditForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleAdjustCredits('add')} 
                  className="flex-1"
                  disabled={!creditForm.amount || !creditForm.reason}
                  variant="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credits
                </Button>
                <Button 
                  onClick={() => handleAdjustCredits('subtract')} 
                  className="flex-1"
                  disabled={!creditForm.amount || !creditForm.reason}
                  variant="destructive"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove Credits
                </Button>
              </div>
              <Button 
                onClick={() => handleAdjustCredits('set')} 
                className="w-full"
                disabled={!creditForm.amount || !creditForm.reason}
                variant="outline"
              >
                <Coins className="h-4 w-4 mr-2" />
                Set to {creditForm.amount || 0} Credits
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 