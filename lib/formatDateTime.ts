/** Date and time for display on trustbuild.uk (UK locale). */
export function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
