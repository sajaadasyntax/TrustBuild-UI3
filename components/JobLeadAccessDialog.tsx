"use client"

import { useState, useEffect } from 'react'
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
  Target
} from 'lucide-react'
import { jobsApi, paymentsApi, contractorsApi, handleApiError, Job, Contractor } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

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
  };
  onAccessGranted?: () => void;
}

interface StripePaymentFormProps {
  leadPrice: number;
  job: JobLeadAccessDialogProps['job'];
  onSuccess: () => void;
  onCancel: () => void;
  contractor: Contractor | null;
}

function StripePaymentForm({ leadPrice, job, onSuccess, onCancel, contractor }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      // Enhanced authentication check with debugging
      const token = localStorage.getItem('auth_token')
      console.log('🔍 Payment Intent - Auth Check:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20)
      })
      
      if (!token) {
        console.error('❌ No auth token found')
        toast({
          title: "Authentication Required",
          description: "Please log in to continue with payment.",
          variant: "destructive"
        })
        // Redirect to login
        window.location.href = '/login'
        return
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const isExpired = Date.now() > payload.exp * 1000
        console.log('🔍 Token Check:', {
          expires: new Date(payload.exp * 1000),
          isExpired,
          userId: payload.id
        })
        
        if (isExpired) {
          console.error('❌ Token expired')
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
      } catch (e) {
        console.error('❌ Invalid token format:', e)
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        return
      }

      console.log('✅ Auth check passed, creating payment intent...')
      const response = await paymentsApi.createPaymentIntent(job.id)
      console.log('✅ Payment intent created:', response.data)
      setClientSecret(response.data.clientSecret)
    } catch (error) {
      console.error('❌ Payment Intent Error:', error)
      
      // Handle specific authentication errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        console.error('❌ Authentication error detected')
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
      
      handleApiError(error, 'Failed to initialize payment')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please try again.",
        variant: "destructive"
      })
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast({
        title: "Payment Error", 
        description: "Card information not found. Please try again.",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: contractor?.user?.name || 'Contractor',
          },
        },
      })

      if (error) {
        throw new Error(error.message || 'Payment failed')
      }

      if (paymentIntent?.status === 'succeeded') {
        // Call backend to complete job access purchase
        const result = await paymentsApi.purchaseJobAccess({
          jobId: job.id,
          paymentMethod: 'STRIPE',
          stripePaymentIntentId: paymentIntent.id
        })
        
        toast({
          title: "Payment Successful!",
          description: `Job access purchased. Payment of £${leadPrice} processed. Invoice #${result.invoice?.invoiceNumber || 'generated'}.`,
        })
        
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      handleApiError(error, 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">Card Details</h4>
        <div className="border rounded p-3 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay £{leadPrice}
            </>
          )}
        </Button>
      </div>
    </form>
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
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT' | 'STRIPE' | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  useEffect(() => {
    if (isOpen && job) {
      fetchContractor()
    }
  }, [isOpen, job])

  const fetchContractor = async () => {
    try {
      setLoading(true)
      // Fetch fresh contractor data to get accurate credit balance
      const contractorData = await contractorsApi.getMyProfile()
      setContractor(contractorData)
    } catch (error) {
      handleApiError(error, 'Failed to fetch contractor information')
      // Fallback to user.contractor if API fails
      if (user?.contractor) {
        setContractor(user.contractor)
      }
    } finally {
      setLoading(false)
    }
  }

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

      // Refresh contractor data to get updated credit balance
      await fetchContractor()

      toast({
        title: "Access Granted!",
        description: `Job details unlocked using 1 credit. Invoice #${result.invoice?.invoiceNumber || 'generated'}.`,
      })
      
      onAccessGranted?.()
      onClose()
    } catch (error) {
      handleApiError(error, 'Failed to purchase job access')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleStripePayment = () => {
    setShowStripeForm(true)
  }

  const handleStripeSuccess = () => {
    setShowStripeForm(false)
    onAccessGranted?.()
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

  // Check if this is a quote-on-request job
  const isQuoteOnRequest = !job.budget || job.budget === 0;

  // Get effective lead price based on the TrustBuilders pricing model
  const getEffectiveLeadPrice = () => {
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

  const leadPrice = getEffectiveLeadPrice();
  const creditsBalance = contractor?.creditsBalance || 0;



  // Note: We now use fallback pricing instead of showing an error
  // This ensures jobs can always be accessed even if service pricing is missing

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
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
      <DialogContent className="max-w-2xl">
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
                  {job.budget ? formatCurrency(job.budget) : 'Quote on request'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Price:</span>
                <span className="font-bold text-lg">{formatCurrency(leadPrice)}</span>
              </div>
            </div>
          </div>

          {/* Credit Balance Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Your Credits</h4>
                <p className="text-sm text-blue-700">
                  You have {creditsBalance} credits available
                </p>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {creditsBalance}
              </div>
            </div>
            {creditsBalance < 1 && (
              <p className="text-sm text-blue-700 mt-2">
                💡 Credits reset weekly. Subscribe to get 3 free credits every week!
              </p>
            )}
          </div>

          {showStripeForm ? (
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                leadPrice={leadPrice}
                job={job}
                onSuccess={handleStripeSuccess}
                onCancel={handleStripeCancel}
                contractor={contractor}
              />
            </Elements>
          ) : (
            <>
              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="font-semibold">Choose Payment Method</h3>
                
                {/* Credits Option */}
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  paymentMethod === 'CREDIT' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } ${creditsBalance < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => creditsBalance >= 1 && setPaymentMethod('CREDIT')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={paymentMethod === 'CREDIT'}
                        disabled={creditsBalance < 1}
                        onChange={() => setPaymentMethod('CREDIT')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          Use Credit (Recommended)
                          {creditsBalance >= 1 && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Best Value
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Available credits: {creditsBalance}
                          {creditsBalance < 1 && " (Insufficient credits)"}
                        </div>
                        {creditsBalance >= 1 && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ No additional cost • Instant access
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">1 Credit</div>
                  </div>
                </div>

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
                        <div className="font-medium">Pay with Card</div>
                        <div className="text-sm text-gray-600">
                          One-time payment • Secure card processing
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          💳 Visa, Mastercard, Amex accepted
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(leadPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {paymentMethod === 'CREDIT' ? (
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
                    Pay {formatCurrency(leadPrice)}
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