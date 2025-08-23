import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Award,
  Star,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap,
  TrendingUp,
  Search,
  CheckCheck,
  Sparkles
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { handleApiError } from '@/lib/api'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51OUW6uDYzE0QVbJQXgYYXzDPPIVEzXG2NQmIYIyDdUOWDrTrUHvPkBGpGxEVOyRgzrJQOxqZKhkzs5yFYRFLrPuQ00Qx5XkWzZ')

interface SubscriptionPlan {
  id: string
  name: string
  monthly: number
  total: number
  discount: number
  discountPercentage: number
  duration: number
  durationUnit: string
  features: string[]
}

interface SubscriptionDetails {
  id: string
  plan: string
  planName: string
  status: string
  isActive: boolean
  startDate: string
  endDate: string
  nextBillingDate: string
  daysRemaining: number
  pricing: {
    monthly: number
    total: number
    discount: number
    discountPercentage: number
    duration: number
    durationUnit: string
  }
}

// Payment Form Component
const PaymentForm = ({ 
  clientSecret, 
  plan, 
  onSuccess, 
  onCancel 
}: { 
  clientSecret: string
  plan: SubscriptionPlan
  onSuccess: () => void
  onCancel: () => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }
    
    setProcessing(true)
    setError(null)
    
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'https://www.trustbuild.uk/dashboard/contractor/payments?payment_success=true',
        },
        redirect: 'if_required',
      })
      
      if (result.error) {
        setError(result.error.message || 'Payment failed')
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Call confirm endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripePaymentIntentId: result.paymentIntent.id,
            plan: plan.id,
          }),
        })
        
        if (response.ok) {
          toast({
            title: 'Subscription Activated',
            description: `Your ${plan.name} subscription has been activated successfully.`,
          })
          onSuccess()
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to confirm subscription')
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Payment error:', err)
    } finally {
      setProcessing(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md bg-slate-50 p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Subscription Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Plan:</div>
          <div className="font-medium">{plan.name}</div>
          <div>Duration:</div>
          <div className="font-medium">{plan.duration} {plan.durationUnit}</div>
          <div>Price:</div>
          <div className="font-medium">£{plan.total.toFixed(2)}</div>
          {plan.discount > 0 && (
            <>
              <div>Savings:</div>
              <div className="font-medium text-green-600">£{plan.discount.toFixed(2)} ({plan.discountPercentage}%)</div>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <PaymentElement />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      </div>
    </form>
  )
}

// Plan Card Component
const PlanCard = ({ 
  plan, 
  isActive, 
  isSelected,
  onSelect 
}: { 
  plan: SubscriptionPlan
  isActive: boolean
  isSelected: boolean
  onSelect: (plan: SubscriptionPlan) => void
}) => {
  const isBestValue = plan.id === 'YEARLY'
  
  return (
    <Card className={`relative overflow-hidden transition-all ${
      isActive ? 'border-2 border-green-500' : 
      isSelected ? 'border-2 border-blue-500' :
      isBestValue ? 'border-blue-200' : ''
    } hover:shadow-md`}>
      {isBestValue && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold py-1 px-4 transform rotate-45 translate-x-[30%] translate-y-[10%]">
          BEST VALUE
        </div>
      )}
      
      {isActive && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Current Plan
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.duration} {plan.durationUnit} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-bold text-slate-900">
            £{plan.monthly.toFixed(2)}
            <span className="text-sm font-normal text-slate-500">/month</span>
          </div>
          <div className="text-sm text-slate-500">
            {plan.duration > 1 ? (
              <>Total: £{plan.total.toFixed(2)}</>
            ) : (
              <>Billed monthly</>
            )}
          </div>
          {plan.discount > 0 && (
            <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
              Save {plan.discountPercentage}%
            </Badge>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          variant={isActive ? "outline" : isSelected ? "secondary" : "default"}
          disabled={isActive}
          onClick={() => !isActive && onSelect(plan)}
        >
          {isActive ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Current Subscription Component
const CurrentSubscription = ({ 
  subscription, 
  onCancel,
  onUpgrade
}: { 
  subscription: SubscriptionDetails
  onCancel: () => void
  onUpgrade: () => void
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  
  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/cancel`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: 'Subscription Cancelled',
          description: `Your subscription has been cancelled. You'll have access until ${subscription.endDate}.`,
        })
        setShowCancelDialog(false)
        onCancel()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to cancel subscription',
          variant: 'destructive',
        })
      }
    } catch (error) {
      handleApiError(error, 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }
  
  const isActive = subscription.isActive && subscription.status === 'active'
  const isCancelled = subscription.status === 'cancelled'
  const progressValue = Math.max(0, Math.min(100, (subscription.daysRemaining / 30) * 100))
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your {subscription.planName} Subscription</CardTitle>
            <CardDescription>
              {isActive ? 'Active subscription with premium benefits' : 
               isCancelled ? 'Subscription cancelled but still active until end date' : 
               'Subscription status: ' + subscription.status}
            </CardDescription>
          </div>
          <Badge className={`${
            isActive ? 'bg-green-100 text-green-800' : 
            isCancelled ? 'bg-orange-100 text-orange-800' : 
            'bg-slate-100 text-slate-800'
          }`}>
            {isActive ? 'Active' : isCancelled ? 'Cancelled' : subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Start Date</div>
            <div className="font-medium flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-slate-500" />
              {subscription.startDate}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Next Billing Date</div>
            <div className="font-medium flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-slate-500" />
              {isCancelled ? 'Not renewing' : subscription.nextBillingDate}
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subscription Period</span>
            <span className="font-medium">{subscription.daysRemaining} days remaining</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        
        <div className="rounded-md bg-slate-50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Premium Benefits Active</p>
              <p className="text-muted-foreground">
                {isActive 
                  ? 'Your subscription is active with all premium benefits.' 
                  : isCancelled 
                    ? `Your benefits will remain active until ${subscription.endDate}.`
                    : 'Your subscription status may need attention.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setShowCancelDialog(true)}
          disabled={isCancelled}
        >
          {isCancelled ? 'Already Cancelled' : 'Cancel Subscription'}
        </Button>
        <Button onClick={onUpgrade}>
          Change Plan
        </Button>
      </CardFooter>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your {subscription.planName} subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Your subscription will remain active until the end date</p>
                  <p>You will continue to have access to all premium features until {subscription.endDate}.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              After cancellation, your account will revert to a non-subscribed contractor account. 
              You can resubscribe at any time.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
            >
              Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Main Subscription Manager Component
export default function SubscriptionManager() {
  const router = useRouter()
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionDetails | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check URL for payment success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('payment_success') === 'true') {
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been activated successfully.',
      })
      // Remove the query parameter
      router.replace('/dashboard/contractor/payments')
    }
  }, [router])
  
  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch current subscription
        const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/current`)
        if (!subscriptionResponse.ok) {
          throw new Error('Failed to fetch subscription data')
        }
        const subscriptionData = await subscriptionResponse.json()
        setCurrentSubscription(subscriptionData.data.subscription)
        
        // Fetch plans
        const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/plans`)
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch subscription plans')
        }
        const plansData = await plansResponse.json()
        setPlans(plansData.data.plans)
      } catch (error) {
        console.error('Error fetching subscription data:', error)
        setError('Failed to load subscription data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubscriptionData()
  }, [])
  
  // Handle plan selection
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    try {
      setSelectedPlan(plan)
      setProcessingPayment(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment intent')
      }
      
      const data = await response.json()
      setClientSecret(data.data.clientSecret)
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      setError(error.message || 'Failed to initialize payment. Please try again.')
      setSelectedPlan(null)
    } finally {
      setProcessingPayment(false)
    }
  }
  
  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      setLoading(true)
      // Refresh subscription data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/current`)
      if (!response.ok) {
        throw new Error('Failed to fetch updated subscription data')
      }
      
      const data = await response.json()
      setCurrentSubscription(data.data.subscription)
      setSelectedPlan(null)
      setClientSecret(null)
    } catch (error) {
      console.error('Error refreshing subscription data:', error)
      setError('Subscription was processed, but failed to update data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle cancellation success
  const handleCancellationSuccess = async () => {
    try {
      setLoading(true)
      // Refresh subscription data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'}/subscriptions/current`)
      if (!response.ok) {
        throw new Error('Failed to fetch updated subscription data')
      }
      
      const data = await response.json()
      setCurrentSubscription(data.data.subscription)
    } catch (error) {
      console.error('Error refreshing subscription data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Handle payment cancellation
  const handleCancelPayment = () => {
    setSelectedPlan(null)
    setClientSecret(null)
  }
  
  // Handle upgrade subscription
  const handleUpgradeSubscription = () => {
    setSelectedPlan(null)
    setClientSecret(null)
  }
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Manage your contractor subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-[125px] w-full" />
        </CardContent>
      </Card>
    )
  }
  
  // Show payment form if a plan is selected and client secret is available
  if (selectedPlan && clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscribe to {selectedPlan.name} Plan</CardTitle>
          <CardDescription>Complete your subscription payment</CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm 
              clientSecret={clientSecret}
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelPayment}
            />
          </Elements>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Current Subscription Section */}
      {currentSubscription ? (
        <CurrentSubscription 
          subscription={currentSubscription} 
          onCancel={handleCancellationSuccess}
          onUpgrade={handleUpgradeSubscription}
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              Subscribe to a plan to access premium features and benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Unlock Premium Benefits</p>
                  <p>Subscribe to a plan to access premium features, priority listings, and more.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Subscription Plans Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Available Subscription Plans</h3>
          <p className="text-sm text-muted-foreground">
            Choose the plan that works best for your business
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              isActive={currentSubscription?.plan === plan.id && currentSubscription?.isActive}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>
      
      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Benefits</CardTitle>
          <CardDescription>
            Why subscribe to TrustBuild premium plans?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Search className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium">Enhanced Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Get priority placement in search results and featured status on job listings.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Zap className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h4 className="font-medium">No Commission Fees</h4>
                <p className="text-sm text-muted-foreground">
                  Keep 100% of your earnings with no commission fees on completed jobs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h4 className="font-medium">Premium Profile Badge</h4>
                <p className="text-sm text-muted-foreground">
                  Stand out with a premium badge that builds trust with potential customers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-medium">Business Growth</h4>
                <p className="text-sm text-muted-foreground">
                  Access advanced analytics and tools to grow your contracting business.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
