import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { manualInvoiceId, stripePaymentIntentId } = await request.json()
    
    if (!manualInvoiceId || !stripePaymentIntentId) {
      return NextResponse.json(
        { message: 'Manual invoice ID and payment intent ID are required' },
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
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk'
    
    // Ensure API URL doesn't end with /api to avoid double /api/api/
    if (apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.slice(0, -4)
    }

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/api/payments/pay-manual-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ manualInvoiceId, stripePaymentIntentId }),
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

