export type TrackingEvent = {
  event: string
  [key: string]: string | number | undefined
}

declare global {
  interface Window {
    dataLayer?: TrackingEvent[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(event: string, parameters: Omit<TrackingEvent, 'event'> = {}) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...parameters })

  if (window.gtag) {
    window.gtag('event', event, parameters)
  }
}

export function trackJobPosted(jobId: string) {
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
  const formattedConversionId = conversionId?.startsWith('AW-') ? conversionId : `AW-${conversionId}`

  trackEvent('job_posted', {
    transaction_id: jobId,
    value: 1,
    currency: 'GBP',
  })

  if (conversionId && conversionLabel && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${formattedConversionId}/${conversionLabel}`,
      value: 1,
      currency: 'GBP',
      transaction_id: jobId,
    })
  }
}