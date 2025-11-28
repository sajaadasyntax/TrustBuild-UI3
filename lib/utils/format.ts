/**
 * Shared formatting utilities for TrustBuild
 */

/**
 * Format a number as GBP currency
 */
export function formatCurrency(amount: number | undefined | null, options?: {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}): string {
  if (amount === undefined || amount === null) {
    return 'Not specified'
  }
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount)
}

/**
 * Format a date string to locale date
 */
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'Unknown'
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'Unknown'
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  
  return formatDate(date)
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return '??'
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Format a phone number (UK format)
 */
export function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // UK mobile format: 07XXX XXX XXX
  if (digits.length === 11 && digits.startsWith('07')) {
    return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  
  // UK landline format: 0XXXX XXXXXX
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  
  // Return original if format not recognized
  return phone
}

