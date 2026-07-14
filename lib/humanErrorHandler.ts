import { ApiError } from './api';

/**
 * Maps technical errors to clear, user-friendly messages.
 * Use this instead of surfacing raw exception text in toasts or inline error states.
 */
export function getHumanReadableError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  // Backend ApiError: already contains a user-facing message from the server
  if (error instanceof ApiError) {
    const msg = humaniseBackendMessage(error.message);
    // Never surface raw HTTP status codes ("403", "API request failed with status 500", …)
    if (msg && !containsRawStatusCode(msg)) return msg;
    return humaniseStatusCode(error.status) || fallback;
  }

  // Generic Error objects
  if (error instanceof Error) {
    const msg = error.message;

    // Network / fetch failures
    if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network')) {
      return 'Unable to reach the server. Check your internet connection and try again.';
    }

    // JSON parse errors (corrupt/unexpected response)
    if (msg.includes('JSON') || msg.includes('Unexpected token')) {
      return 'Received an unexpected response from the server. Please try again.';
    }

    // Stripe errors often come wrapped as Error with a message
    const stripeMsg = humaniseStripeMessage(msg);
    if (stripeMsg) return stripeMsg;

    // Let through short, readable messages
    if (msg && msg.length < 200 && !msg.includes('at ') && !msg.includes('prisma')) {
      return humaniseBackendMessage(msg) || fallback;
    }

    return fallback;
  }

  // String errors
  if (typeof error === 'string') {
    return humaniseBackendMessage(error) || fallback;
  }

  // Object with a message field (e.g. Stripe error objects)
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    if (typeof obj.message === 'string') {
      const stripeMsg = humaniseStripeMessage(obj.message);
      if (stripeMsg) return stripeMsg;
      return humaniseBackendMessage(obj.message) || fallback;
    }

    // Stripe error code only
    if (typeof obj.code === 'string') {
      return humaniseStripeCode(obj.code) || fallback;
    }
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function humaniseBackendMessage(msg: string): string | null {
  if (!msg) return null;

  const lower = msg.toLowerCase();

  // Raw status-code style messages ("403", "Request failed with status 500", "HTTP 404")
  if (containsRawStatusCode(msg)) {
    const codeMatch = msg.match(/\b([45]\d\d)\b/);
    if (codeMatch) {
      return humaniseStatusCode(parseInt(codeMatch[1], 10));
    }
    return null;
  }

  // Auth / session
  if (lower.includes('invalid token') || lower.includes('jwt')) {
    return 'Your session has expired. Please log in again.';
  }
  if (lower.includes('unauthorized') || lower.includes('not authenticated')) {
    return 'You need to be logged in to do that.';
  }
  if (lower.includes('forbidden') || lower.includes('do not have permission')) {
    return "You don't have permission to perform this action.";
  }

  // Not found
  if (lower.includes('not found') && lower.length < 60) {
    return 'The requested item could not be found.';
  }

  // Rate limiting
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Already exists / duplicate
  if (lower.includes('already exists') || lower.includes('duplicate')) {
    return 'This record already exists.';
  }

  // Payments
  if (lower.includes('payment failed') || lower.includes('card was declined')) {
    return 'Your payment was declined. Please check your card details and try again.';
  }
  if (lower.includes('insufficient funds')) {
    return 'Your card has insufficient funds. Please use a different payment method.';
  }
  if (lower.includes('no longer available to purchase')) {
    return 'This job is no longer available for purchase.';
  }
  if (lower.includes('reached its limit') || lower.includes('contractor limit')) {
    return 'This job has reached its maximum number of contractors.';
  }

  // Validation (Prisma / express-validator)
  if (lower.includes('invalid input') || lower.includes('validation')) {
    return 'Some of the information you entered is invalid. Please review and try again.';
  }

  // Server errors
  if (lower.includes('internal server error') || lower === 'something went wrong!') {
    return 'An unexpected error occurred on our end. Please try again shortly.';
  }

  // Return the original message if it looks user-facing (short, no stack trace keywords)
  if (msg.length < 150 && !msg.includes('at ') && !msg.includes('prisma') && !msg.includes('Error:')) {
    return msg;
  }

  return null;
}

/**
 * True when a message is just a status code or embeds one, e.g. "403",
 * "API request failed with status 500", "Request failed: 404", "HTTP 429".
 */
function containsRawStatusCode(msg: string): boolean {
  const trimmed = msg.trim();
  if (/^[45]\d\d$/.test(trimmed)) return true;
  return /\b(status|http|code|error)\s*:?\s*[45]\d\d\b/i.test(trimmed) ||
    /\bfailed with status\b/i.test(trimmed) ||
    /\b[45]\d\d\s*(error|forbidden|unauthorized|not found)\b/i.test(trimmed);
}

/** Friendly text for HTTP status codes so users never see bare numbers. */
function humaniseStatusCode(status: number): string | null {
  switch (status) {
    case 400: return 'The request could not be processed. Please check your input and try again.';
    case 401: return 'You need to be logged in to do that. Please log in and try again.';
    case 402: return 'A payment is required to complete this action.';
    case 403: return "You don't have permission to perform this action.";
    case 404: return 'The requested item could not be found.';
    case 408: return 'The request timed out. Please try again.';
    case 409: return 'This conflicts with an existing record. Please refresh and try again.';
    case 413: return 'The file or data you sent is too large.';
    case 422: return 'Some of the information you entered is invalid. Please review and try again.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'An unexpected error occurred on our end. Please try again shortly.';
    case 502:
    case 503:
    case 504: return 'The server is temporarily unavailable. Please try again in a few minutes.';
    default:
      if (status >= 500) return 'An unexpected error occurred on our end. Please try again shortly.';
      if (status >= 400) return 'Something went wrong with your request. Please try again.';
      return null;
  }
}

function humaniseStripeMessage(msg: string): string | null {
  const lower = msg.toLowerCase();
  if (lower.includes('card was declined')) return 'Your card was declined. Please try a different card.';
  if (lower.includes('incorrect cvc') || lower.includes('security code')) return 'The security code you entered is incorrect. Please check and try again.';
  if (lower.includes('expired card')) return 'Your card has expired. Please use a different card.';
  if (lower.includes('incorrect number') || lower.includes('card number')) return 'The card number you entered is invalid.';
  if (lower.includes('insufficient funds')) return 'Your card has insufficient funds. Please use a different payment method.';
  if (lower.includes('do not honor')) return 'Your card issuer declined the payment. Please contact your bank or use a different card.';
  if (lower.includes('stripe') && lower.includes('not loaded')) return 'Payment provider failed to load. Please refresh the page and try again.';
  return null;
}

function humaniseStripeCode(code: string): string | null {
  const map: Record<string, string> = {
    card_declined: 'Your card was declined. Please try a different card.',
    insufficient_funds: 'Your card has insufficient funds.',
    expired_card: 'Your card has expired.',
    incorrect_cvc: 'The security code you entered is incorrect.',
    incorrect_number: 'The card number you entered is invalid.',
    processing_error: 'A processing error occurred. Please try again.',
    authentication_required: 'Your bank requires additional authentication. Please follow your bank\'s instructions.',
  };
  return map[code] || null;
}
