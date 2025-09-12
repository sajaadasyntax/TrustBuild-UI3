import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { commissionPaymentId, stripePaymentIntentId } = await request.json()
    
    if (!commissionPaymentId || !stripePaymentIntentId) {
      return NextResponse.json(
        { message: 'Commission payment ID and Stripe payment intent ID are required' },
        { status: 400 }
      )
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/payments/pay-commission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ commissionPaymentId, stripePaymentIntentId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to process payment' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
