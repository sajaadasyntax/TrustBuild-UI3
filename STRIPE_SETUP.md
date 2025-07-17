# Stripe Payment Integration Setup Guide

## Environment Variables Required

### Frontend (.env.local)
Create a `.env.local` file in the `project/` directory with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Application Settings
NEXT_PUBLIC_APP_NAME=TrustBuild
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
Create a `.env` file in the `backend/` directory with:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@your-neon-hostname.neon.tech/dbname?sslmode=require"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES_PER_UPLOAD=5
```

## Stripe Test Keys

For development, use Stripe test keys which you can get from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):

- **Publishable Key**: Starts with `pk_test_`
- **Secret Key**: Starts with `sk_test_`

## Features Implemented

### 1. Secure Card Payments
- **Stripe Elements**: Secure card input fields
- **Payment Intents**: Server-side payment intent creation
- **3D Secure**: Automatic handling of Strong Customer Authentication
- **Error Handling**: Comprehensive error messages and retry logic

### 2. Dual Payment Options
- **Credit System**: Use weekly credits (3 free credits per contractor)
- **Direct Payment**: Pay with card via Stripe

### 3. Dynamic Pricing
- **Job Size Based**: Small (£20), Medium (£35), Large (£50)
- **Quote-on-Request**: Lower fee (£15) for quote jobs
- **Admin Override**: Manual price setting per job

### 4. Security Features
- **Payment Verification**: Server-side Stripe payment confirmation
- **Access Control**: Job details locked until payment
- **Invoice Generation**: Automatic VAT calculation and PDF invoices
- **Audit Trail**: Complete payment and credit transaction logging

## Payment Flow

### For Credit Payment:
1. Check contractor credit balance
2. Deduct 1 credit from balance
3. Create credit transaction record
4. Grant job access
5. Generate invoice (£0 for credit payments)

### For Stripe Payment:
1. Create Stripe payment intent on server
2. Show secure card input form
3. Confirm payment with Stripe
4. Verify payment on server
5. Grant job access
6. Generate invoice with VAT

## Testing

### Test Card Numbers
- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **3D Secure Required**: `4000 0027 6000 3184`

Use any:
- **Expiry**: Future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **Postal Code**: Any valid code (e.g., 12345)

### Testing Scenarios
1. **Credit Payment**: Ensure contractor has credits, test deduction
2. **Card Payment**: Use test card, verify payment intent creation
3. **Insufficient Credits**: Test fallback to card payment
4. **Payment Failure**: Test error handling and user feedback
5. **Job Access**: Verify content is locked/unlocked correctly

## Webhook Setup (Optional)

For production, set up Stripe webhooks to handle:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

## Troubleshooting

### Common Issues:
1. **"Stripe not loaded"**: Check publishable key in environment
2. **Payment intent error**: Verify secret key and API connectivity
3. **CORS errors**: Ensure frontend URL is correct in backend
4. **Database errors**: Check Prisma migration status

### Debug Steps:
1. Check browser console for frontend errors
2. Check backend server logs for API errors
3. Verify Stripe Dashboard for payment attempts
4. Test with minimal amounts (£1) first

## Production Deployment

1. Replace test keys with live Stripe keys
2. Set up webhook endpoints
3. Configure SSL/HTTPS
4. Test with real bank cards (small amounts)
5. Monitor Stripe Dashboard for issues 