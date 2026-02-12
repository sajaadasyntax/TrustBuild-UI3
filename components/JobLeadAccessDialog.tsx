"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Coins, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Info,
  User,
  Briefcase,
  Eye,
  RefreshCw,
  DollarSign,
  Target,
  Loader2
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { jobsApi, paymentsApi, contractorsApi, handleApiError, Job, Contractor } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe with enhanced error handling
const initializeStripe = async () => {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_FALLBACK_KEY_NOT_SET'
    
    console.log('🔄 Initializing Stripe with key:', publishableKey.substring(0, 20) + '...')
    
    const stripe = await loadStripe(publishableKey)
    
    if (!stripe) {
      throw new Error('Failed to load Stripe')
    }
    
    console.log('✅ Stripe loaded successfully')
    return stripe
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error)
    // Return fallback test Stripe instance
    return loadStripe('pk_test_FALLBACK_KEY_NOT_SET')
  }
}

const stripePromise = initializeStripe()

export interface JobLeadAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    location: string;
    description: string;
    budget?: number;
    jobSize?: 'SMALL' | 'MEDIUM' | 'LARGE';
    leadPrice?: number;
    requiresQuote?: boolean;
    service?: {
      name: string;
      smallJobPrice: number;
      mediumJobPrice: number;
      largeJobPrice: number;
    };
    // New contractor tracking properties
    contractorsWithAccess?: number;
    maxContractorsPerJob?: number;
    spotsRemaining?: number;
  };
  onAccessGranted?: () => void;
}

interface StripePaymentFormProps {
  leadPrice: number;
  job: JobLeadAccessDialogProps['job'];
  onSuccess: (purchaseResult?: any) => void;
  onCancel: () => void;
  contractor: Contractor | null;
  isSubscriber?: boolean;
}

// Inner form component that lives INSIDE <Elements> with clientSecret
function StripePaymentInnerForm({ leadPrice, job, onSuccess, onCancel, contractor, isSubscriber = false }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Confirm payment using PaymentElement (supports cards, Apple Pay, Google Pay)
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/contractor?payment_success=true`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Call backend to complete job access purchase
        const result = await paymentsApi.purchaseJobAccess({
          jobId: job.id,
          paymentMethod: isSubscriber ? 'STRIPE_SUBSCRIBER' : 'STRIPE',
          stripePaymentIntentId: paymentIntent.id
        })
        
        const successMessage = isSubscriber 
          ? `Job access purchased. No commission will be charged. Invoice #${result.invoice?.invoiceNumber || 'generated'}.`
          : `Job access purchased. Payment of £${(leadPrice * 1.20).toFixed(2)} processed. Invoice #${result.invoice?.invoiceNumber || 'generated'}.`
        
        toast({
          title: "Payment Successful!",
          description: successMessage,
        })
        
        // Pass the full result (including customerContact) to parent
        onSuccess(result?.data || result)
      }
    } catch (err) {
      console.error('Payment error:', err)
      handleApiError(err, 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-1">Payment Method</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Pay securely with card, Apple Pay, or Google Pay
        </p>
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm">
          <Lock className="h-4 w-4" />
          <span>Your payment is secured by Stripe</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay £{(leadPrice * 1.20).toFixed(2)} (incl. VAT)
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Outer wrapper: creates payment intent first, then renders Elements with clientSecret
function StripePaymentForm({ leadPrice, job, onSuccess, onCancel, contractor, isSubscriber = false }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)

        // Authentication check
        const token = localStorage.getItem('auth_token')
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to continue with payment.",
            variant: "destructive"
          })
          window.location.href = '/login'
          return
        }

        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (Date.now() > payload.exp * 1000) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive"
            })
            window.location.href = '/login'
            return
          }
        } catch {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          return
        }

        const response = await paymentsApi.createPaymentIntent(job.id)
        setClientSecret(response.data.clientSecret)
      } catch (error) {
        console.error('Payment Intent Error:', error)

        if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          toast({
            title: "Authentication Failed",
            description: "Your session is invalid. Please log in again.",
            variant: "destructive"
          })
          window.location.href = '/login'
          return
        }

        if (error instanceof Error && error.message.includes('Invalid API Key')) {
          toast({
            title: "Payment System Error",
            description: "There's an issue with our payment system. Please try using credits instead or contact support.",
            variant: "destructive"
          })
          setInitError('Payment system configuration error. Please try credits or contact support.')
          return
        }

        setInitError(error instanceof Error ? error.message : 'Failed to initialize payment')
        handleApiError(error, 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [job.id])

  if (isLoading) {
    return (
      <div className="space-y-4 p-2">
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading payment form...</span>
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {initError || 'Failed to initialize payment. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            fontFamily: 'system-ui, sans-serif',
          },
        },
      }}
    >
      <StripePaymentInnerForm
        leadPrice={leadPrice}
        job={job}
        onSuccess={onSuccess}
        onCancel={onCancel}
        contractor={contractor}
        isSubscriber={isSubscriber}
      />
    </Elements>
  )
}

export default function JobLeadAccessDialog({ 
  job, 
  isOpen, 
  onClose, 
  onAccessGranted 
}: JobLeadAccessDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [currentLeadPrice, setCurrentLeadPrice] = useState<number | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT' | 'STRIPE' | 'STRIPE_SUBSCRIBER' | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  const [hasSubscription, setHasSubscription] = useState<boolean>(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null)

  const fetchContractor = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch fresh contractor data to get accurate credit balance
      const contractorData = await contractorsApi.getMyProfile()
      setContractor(contractorData)
      
      // Check subscription status
      const subscription = contractorData?.subscription || null
      const hasActiveSubscription = subscription && 
                                   typeof subscription === 'object' &&
                                   'isActive' in subscription &&
                                   'status' in subscription &&
                                   subscription.isActive === true && 
                                   subscription.status === 'active'
      setHasSubscription(!!hasActiveSubscription)
      // Type assertion for subscription plan
      if (hasActiveSubscription && subscription && 'plan' in subscription && subscription.plan) {
        setSubscriptionPlan(String(subscription.plan))
      } else {
        setSubscriptionPlan(null)
      }
      
      // Fetch current lead price to ensure we have the latest admin pricing
      try {
        const accessData = await jobsApi.checkAccess(job.id)
        setCurrentLeadPrice(accessData.leadPrice)
        console.log('Updated lead price from server:', accessData.leadPrice)
      } catch (accessError) {
        console.error('Failed to fetch current lead price:', accessError)
        // Fallback to job's lead price if access check fails
        setCurrentLeadPrice(null)
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch contractor information')
      // Fallback to user.contractor if API fails
      if (user?.contractor) {
        setContractor(user.contractor)
      }
    } finally {
      setLoading(false)
    }
  }, [job, user])

  useEffect(() => {
    if (isOpen && job) {
      fetchContractor()
    }
  }, [isOpen, job, fetchContractor])

  const handleCreditPayment = async () => {
    if (!job || !user) return

    // Validate credit balance before proceeding
    if (creditsBalance < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to access this job. Please purchase credits or use card payment.",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessingPayment(true)
      const result = await paymentsApi.purchaseJobAccess({
        jobId: job.id,
        paymentMethod: 'CREDIT'
      })

      // Update the contractor data with the new credit balance from the response
      if (contractor && result.data?.updatedCreditsBalance !== undefined) {
        setContractor({
          ...contractor,
          creditsBalance: result.data.updatedCreditsBalance
        })
      }

      toast({
        title: "Access Granted!",
        description: `Job details unlocked using 1 credit. Credits remaining: ${result.data?.updatedCreditsBalance || 'unknown'}`,
      })
      
      // Pass customer contact data from the purchase result to the parent
      if (onAccessGranted) onAccessGranted(result?.data || result)
      onClose()
    } catch (error) {
      handleApiError(error, 'Failed to purchase job access')
      // Refresh contractor data in case of error to get accurate balance
      await fetchContractor()
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleStripePayment = () => {
    setShowStripeForm(true)
  }

  const handleStripeSuccess = (purchaseResult?: any) => {
    setShowStripeForm(false)
    // Pass customer contact data from the purchase result to the parent
    if (onAccessGranted) onAccessGranted(purchaseResult)
    onClose()
  }

  const handleStripeCancel = () => {
    setShowStripeForm(false)
    setPaymentMethod(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }


  // Get effective lead price based on the TrustBuilders pricing model
  const getEffectiveLeadPrice = () => {
    // First, use the current lead price from server if available (most up-to-date)
    if (currentLeadPrice !== null && currentLeadPrice > 0) {
      return currentLeadPrice;
    }
    
    // Use override price if set
    if (job.leadPrice && job.leadPrice > 0) {
      return job.leadPrice;
    }
    
    // Use service-specific pricing based on job size
    if (job.service && job.jobSize) {
      switch (job.jobSize) {
        case 'SMALL':
          return job.service.smallJobPrice || 0;
        case 'MEDIUM':
          return job.service.mediumJobPrice || 0;
        case 'LARGE':
          return job.service.largeJobPrice || 0;
        default:
          return job.service.mediumJobPrice || 0;
      }
    }
    
    // Fallback pricing if no service data is available
    // This ensures jobs can still be accessed even if service pricing is missing
    switch (job.jobSize) {
      case 'SMALL':
        return 15; // Default small job price
      case 'MEDIUM':
        return 30; // Default medium job price
      case 'LARGE':
        return 50; // Default large job price
      default:
        return 25; // Default price for unknown job size
    }
  };

  const baseLeadPrice = getEffectiveLeadPrice();
  const creditsBalance = contractor?.creditsBalance || 0;
  
  // Use the calculated lead price from service/job settings
  const leadPrice = baseLeadPrice;



  // Note: We now use fallback pricing instead of showing an error
  // This ensures jobs can always be accessed even if service pricing is missing

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Unlock Job Details
          </DialogTitle>
          <DialogDescription>
            Get full access to job details, customer contact information, and the ability to submit a quote.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              {job.contractorsWithAccess || 0} of {job.maxContractorsPerJob || 5} contractors have purchased access 
              • {job.spotsRemaining || 0} spots remaining
            </span>
          </DialogDescription>
        </DialogHeader>

          <div className="space-y-6">
          {/* Job Preview */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Job Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{job.service?.name || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job Size:</span>
                <Badge variant="outline">{job.jobSize}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium">
                  {formatCurrency(job.budget ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Price:</span>
                {hasSubscription ? (
                  <Badge variant="secondary" className="font-bold">FREE with Subscription</Badge>
                ) : (
                  <span className="font-bold text-lg">{formatCurrency(leadPrice)}</span>
                )}
              </div>
              {!hasSubscription && leadPrice > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VAT (20%):</span>
                    <span className="font-medium">{formatCurrency(leadPrice * 0.20)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground font-medium">Total to Pay:</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(leadPrice * 1.20)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Subscription Banner - Show only for subscribers */}
          {hasSubscription && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="mr-4 bg-green-500 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Subscription Active: {subscriptionPlan}</h4>
                    <p className="text-sm text-green-700">
                      Choose your payment method: Use credits (5% commission after completion) or pay lead price (no commission).
                    </p>
                  </div>
                </div>
            </div>
          )}

          {/* Credit Balance Display */}
          {hasSubscription ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Your Credits</h4>
                  <p className="text-sm text-blue-700">
                    You have {creditsBalance} {creditsBalance === 1 ? 'credit' : 'credits'} available
                  </p>
                  {contractor?.lastCreditReset && (
                    <p className="text-xs text-blue-600 mt-1">
                      Next reset: {new Date(new Date(contractor.lastCreditReset).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border border-blue-200">
                  <span className="text-2xl font-bold text-blue-900">{creditsBalance}</span>
                </div>
              </div>
              {creditsBalance < 1 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                  <p className="text-sm text-yellow-700 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
                    You have no credits left. Credits reset weekly!
                  </p>
                </div>
              )}
            </div>
          ) : creditsBalance > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900">Free Trial Credit Available</h4>
                  <p className="text-sm text-green-700">
                    You have {creditsBalance} free trial {creditsBalance === 1 ? 'credit' : 'credits'} available
                  </p>
                  {job.jobSize === 'SMALL' ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Can be used for SMALL jobs only
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ Free trial credits can only be used for SMALL jobs. This job requires payment or subscription.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 border border-green-200">
                  <span className="text-2xl font-bold text-green-900">{creditsBalance}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 bg-orange-500 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-800">No Free Credits Available</h4>
                  <p className="text-sm text-orange-700">
                    Subscribe to get 3 free credits every week, or pay with card to access this job.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showStripeForm ? (
            <StripePaymentForm
              leadPrice={leadPrice}
              job={job}
              onSuccess={handleStripeSuccess}
              onCancel={handleStripeCancel}
              contractor={contractor}
              isSubscriber={hasSubscription && paymentMethod === 'STRIPE_SUBSCRIBER'}
            />
          ) : hasSubscription ? (
            <>
              {/* Subscription Access - Show both options */}
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Payment Method</h3>
                
                {/* Option 1: Use Credits */}
                <div className="border border-green-500 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          Use Credits
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Free Access
                          </Badge>
                        </div>
                        <div className="text-sm text-green-700">
                          Use 1 credit from your weekly allowance
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          ✓ 5% commission on final job amount after completion
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-600">FREE</div>
                  </div>
                </div>

                {/* Option 2: Pay Lead Price */}
                <div className="border border-blue-500 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          Pay Lead Price
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            No Commission
                          </Badge>
                        </div>
                        <div className="text-sm text-blue-700">
                          Pay the full lead price upfront
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          ✓ No commission after job completion
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">{formatCurrency(leadPrice * 1.20)}</div>
                      <div className="text-xs text-muted-foreground">(incl. VAT)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons for subscription users */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Pay lead price method via Stripe (no commission, no credit deduction)
                    setPaymentMethod('STRIPE_SUBSCRIBER')
                    setShowStripeForm(true)
                  }}
                  className="min-w-32"
                >
                  Pay {formatCurrency(leadPrice * 1.20)} (incl. VAT)
                </Button>
                <Button 
                  onClick={() => {
                    // Use credits method (with commission)
                    paymentsApi.purchaseJobAccess({
                      jobId: job.id,
                      paymentMethod: 'CREDIT'
                    }).then((result) => {
                      toast({
                        title: "Access Granted!",
                        description: `Job details unlocked with credits. 5% commission will apply after completion.`,
                      });
                      // Pass customer contact data from the purchase result to the parent
                      if (onAccessGranted) onAccessGranted(result?.data || result);
                      onClose();
                    }).catch(error => {
                      handleApiError(error, 'Failed to access job details');
                    });
                  }}
                  className="min-w-32"
                >
                  Use Credits
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Payment Options for non-subscribers */}
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Payment Method</h3>
                
                {/* Credits Option - Available for non-subscribers with free trial credits on SMALL jobs */}
                {creditsBalance > 0 && job.jobSize === 'SMALL' ? (
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'CREDIT' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('CREDIT')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={paymentMethod === 'CREDIT'}
                          onChange={() => setPaymentMethod('CREDIT')}
                          className="w-4 h-4 text-green-600"
                        />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            Use Free Trial Credit
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Free Access
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Use 1 free trial credit (SMALL jobs only)
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ✓ 5% commission after completion
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-green-600">FREE</div>
                    </div>
                  </div>
                ) : creditsBalance > 0 && job.jobSize !== 'SMALL' ? (
                  <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          disabled
                          className="w-4 h-4 text-gray-400"
                        />
                        <div>
                          <div className="font-medium text-gray-500 flex items-center gap-2">
                            Use Free Trial Credit
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              SMALL Jobs Only
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Free trial credits can only be used for SMALL jobs
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Subscribe or pay with card for {job.jobSize} jobs
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-400">1 Credit</div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          disabled
                          className="w-4 h-4 text-gray-400"
                        />
                        <div>
                          <div className="font-medium text-gray-500 flex items-center gap-2">
                            Use Credit (Subscribers Only)
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              Subscribe Required
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Subscribe to access credit features
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ✓ 5% commission after completion
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-gray-400">1 Credit</div>
                    </div>
                  </div>
                )}

                {/* Card Payment Option */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'STRIPE' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setPaymentMethod('STRIPE')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'STRIPE'}
                        onChange={() => setPaymentMethod('STRIPE')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium">Pay with Card or Wallet</div>
                        <div className="text-sm text-gray-600">
                          One-time payment • Secure processing via Stripe
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Visa, Mastercard, Amex, Apple Pay, Google Pay
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(leadPrice * 1.20)}
                      </div>
                      <div className="text-xs text-muted-foreground">(incl. VAT)</div>
                    </div>
                  </div>
                </div>

                {/* VAT Breakdown for Stripe Payment */}
                {paymentMethod === 'STRIPE' && (
                  <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Lead Price:</span>
                      <span>{formatCurrency(leadPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>{formatCurrency(leadPrice * 0.20)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(leadPrice * 1.20)}</span>
                    </div>
                  </div>
                )}

                {/* Subscription Promotion */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium text-blue-800">💡 TrustBuild Subscription</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Subscribe to get unlimited job access for one low monthly fee. 
                    Only pay a 5% commission on completed jobs!
                  </p>
                  <Button variant="link" className="px-0 py-0 h-auto text-xs text-blue-600" asChild>
                    <Link href="/dashboard/contractor/subscription">Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {(hasSubscription || (creditsBalance > 0 && job.jobSize === 'SMALL')) && paymentMethod === 'CREDIT' ? (
                  <Button 
                    onClick={handleCreditPayment} 
                    disabled={processingPayment || creditsBalance < 1}
                    className="min-w-32"
                  >
                    {processingPayment ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Target className="mr-2 h-4 w-4" />
                    )}
                    {processingPayment ? 'Processing...' : 'Use Credit'}
                  </Button>
                ) : paymentMethod === 'STRIPE' ? (
                  <Button 
                    onClick={handleStripePayment}
                    className="min-w-32"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(leadPrice * 1.20)} (incl. VAT)
                  </Button>
                ) : (
                  <Button disabled className="min-w-32">
                    Select Payment Method
                  </Button>
                )}
              </div>
            </>
          )}

          {/* What You Get */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">What you&apos;ll get:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Full job description and requirements
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Customer contact details
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Ability to submit your quote
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Direct communication with customer
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 