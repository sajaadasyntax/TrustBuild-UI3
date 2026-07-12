import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns a shared Stripe.js instance, initialised from the publishable key env var.
 * Using a singleton prevents redundant script loads across payment flows.
 */
export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Shared PaymentElement options — layout: 'tabs' surfaces Apple Pay / Google Pay
 * as prominent tab options on supported devices, making wallet payment discoverable.
 */
export const paymentElementOptions = {
  layout: 'tabs' as const,
};
