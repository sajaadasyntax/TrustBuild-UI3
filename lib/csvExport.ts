/**
 * CSV Export Utility
 * Provides functions to export data to CSV files
 */

export function exportToCSV(data: any[], filename: string, headers: string[], mapper: (item: any) => any[]) {
  if (data.length === 0) {
    return
  }

  const csvContent = [
    headers.join(','),
    ...data.map(item => {
      const values = mapper(item)
      return values.map(val => {
        // Handle values that might contain commas or quotes
        if (val === null || val === undefined) return ''
        const stringVal = String(val)
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`
        }
        return stringVal
      }).join(',')
    })
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0]
}

