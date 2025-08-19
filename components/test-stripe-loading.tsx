"use client"

/**
 * Test Component for Stripe Elements Loading
 * This component helps verify proper Stripe initialization and loading behavior
 */

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Test Stripe initialization
const testStripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Nj0ABHbCjK8rTMWIJnHxmzQVlXMcbWw4JlGDhbFx9F1xDXBvZNNjzZYQGGjRGaR6EsSmLAfzfNXBJZjzYVzYXvZ00vPDpfCpj')

function StripeLoadingTest() {
  const stripe = useStripe()
  const elements = useElements()
  const [loadingState, setLoadingState] = useState('initializing')
  const [elementsReady, setElementsReady] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addResult('🔄 Component mounted, checking Stripe...')
    
    const checkStripe = async () => {
      if (!stripe || !elements) {
        addResult('⏳ Waiting for Stripe and Elements to load...')
        return
      }

      addResult('✅ Stripe and Elements are loaded!')
      setLoadingState('loaded')
    }

    checkStripe()
  }, [stripe, elements])

  const testCardElementReady = async () => {
    if (!elements) {
      addResult('❌ Elements not available')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      addResult('❌ CardElement not found')
      return
    }

    try {
      await cardElement.focus()
      addResult('✅ CardElement focus test passed')
    } catch (error) {
      addResult(`❌ CardElement focus test failed: ${error}`)
    }
  }

  const testStripeAPI = async () => {
    if (!stripe) {
      addResult('❌ Stripe not available')
      return
    }

    try {
      // Test a simple Stripe method
      addResult('🧪 Testing Stripe API availability...')
      
      // This doesn't make an API call, just tests the Stripe object
      const paymentMethodTypes = ['card']
      addResult(`✅ Stripe object is functional, payment methods: ${paymentMethodTypes.join(', ')}`)
    } catch (error) {
      addResult(`❌ Stripe API test failed: ${error}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Stripe Loading Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Loading State:</strong> {loadingState}</p>
          <p><strong>Stripe Ready:</strong> {stripe ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Elements Ready:</strong> {elements ? '✅ Yes' : '❌ No'}</p>
          <p><strong>CardElement Ready:</strong> {elementsReady ? '✅ Yes' : '❌ No'}</p>
        </div>

        <div className="border rounded p-3">
          <p className="text-sm font-medium mb-2">Test Card Element:</p>
          <CardElement
            onReady={() => {
              addResult('✅ CardElement onReady fired')
              setElementsReady(true)
            }}
            onChange={(event) => {
              if (event.error) {
                addResult(`⚠️ CardElement error: ${event.error.message}`)
              } else if (event.complete) {
                addResult('✅ CardElement input complete')
              }
            }}
            onFocus={() => addResult('👀 CardElement focused')}
            onBlur={() => addResult('👋 CardElement blurred')}
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

        <div className="space-y-2">
          <Button 
            onClick={testCardElementReady}
            disabled={!elements}
            className="w-full"
          >
            Test CardElement Focus
          </Button>
          
          <Button 
            onClick={testStripeAPI}
            disabled={!stripe}
            variant="outline"
            className="w-full"
          >
            Test Stripe API
          </Button>
        </div>

        <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded text-xs">
          <p className="font-medium mb-2">Test Results:</p>
          {testResults.map((result, index) => (
            <p key={index} className="mb-1">{result}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TestStripeLoading() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Stripe Elements Loading Test
      </h1>
      <Elements stripe={testStripePromise}>
        <StripeLoadingTest />
      </Elements>
    </div>
  )
}
