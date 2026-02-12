'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Lock, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CommissionPaymentFormProps {
  commissionPaymentId: string
  amount: number | string
  jobTitle: string
  onSuccess: () => void
  onCancel: () => void
}

// Inner form component rendered inside <Elements> with clientSecret
function CommissionPaymentInnerForm({ 
  commissionPaymentId, 
  amount, 
  jobTitle, 
  onSuccess, 
  onCancel 
}: CommissionPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Safely convert amount to number
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const formattedAmount = isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Confirm payment with Stripe using PaymentElement (supports Apple Pay, Google Pay, cards, etc.)
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
        // Confirm payment with backend
        const confirmResponse = await fetch('/api/payments/pay-commission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            commissionPaymentId,
            stripePaymentIntentId: paymentIntent.id
          })
        })

        if (!confirmResponse.ok) {
          const { message } = await confirmResponse.json()
          throw new Error(message || 'Failed to confirm payment')
        }

        toast({
          title: "Payment Successful",
          description: `Commission payment of £${formattedAmount} has been processed successfully.`,
        })

        onSuccess()
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Payment Method
          </label>
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

        <div className="bg-gray-50 p-4 rounded-md space-y-1">
          <div className="flex justify-between text-sm">
            <span>Commission Amount:</span>
            <span className="font-semibold">£{formattedAmount}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Job:</span>
            <span className="truncate ml-2">{jobTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>Your payment is secured by Stripe</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay £${formattedAmount}`
          )}
        </Button>
      </div>
    </form>
  )
}

// Outer wrapper: creates payment intent first, then renders Elements with clientSecret
export default function CommissionPaymentForm({ 
  commissionPaymentId, 
  amount, 
  jobTitle, 
  onSuccess, 
  onCancel 
}: CommissionPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Create payment intent on mount (before rendering Elements)
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/payments/create-commission-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ commissionPaymentId })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || result.data?.message || 'Failed to create payment intent')
        }

        const secret = result.data?.clientSecret || result.clientSecret
        if (!secret) {
          throw new Error('No client secret received from server')
        }

        setClientSecret(secret)
      } catch (err: any) {
        console.error('Error creating commission payment intent:', err)
        setError(err.message || 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [commissionPaymentId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
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
            {error || 'Failed to initialize payment. Please try again.'}
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
            colorPrimary: '#10b981',
            fontFamily: 'system-ui, sans-serif',
          },
        },
      }}
    >
      <CommissionPaymentInnerForm
        commissionPaymentId={commissionPaymentId}
        amount={amount}
        jobTitle={jobTitle}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}
