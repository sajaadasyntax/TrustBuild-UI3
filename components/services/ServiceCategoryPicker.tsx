"use client"

import { useEffect, useMemo, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Service } from '@/lib/api'
import { fetchActiveServices, groupServicesByCategory, isPersistedServiceId } from '@/lib/serviceCategories'

interface ServiceCategoryPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** When true, only real database service IDs can be selected (for saving to profile). */
  persistedOnly?: boolean
}

export function ServiceCategoryPicker({
  selectedIds,
  onChange,
  disabled = false,
  persistedOnly = true,
}: ServiceCategoryPickerProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveServices().then((list) => {
      setServices(list)
      setLoading(false)
    })
  }, [])

  const visibleServices = useMemo(
    () => (persistedOnly ? services.filter((s) => isPersistedServiceId(s.id)) : services),
    [services, persistedOnly]
  );

  const grouped = useMemo(() => groupServicesByCategory(visibleServices), [visibleServices]);

  const toggle = (id: string) => {
    if (disabled) return
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existing) => existing !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (loading) {
    return <div className="h-24 animate-pulse rounded-md bg-muted" />
  }

  if (visibleServices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No service categories are available yet. Please contact support.
      </p>
    )
  }

  return (
    <div className="space-y-4 rounded-md border p-4 max-h-72 overflow-y-auto">
      <p className="text-sm text-muted-foreground">
        Select the same categories customers choose when posting jobs. This controls which job alerts you receive.
      </p>
      {Object.entries(grouped).map(([category, categoryServices]) => (
        <div key={category} className="space-y-2">
          <p className="text-sm font-semibold">{category}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryServices.map((service) => (
              <label
                key={service.id}
                className={`flex items-start gap-2 rounded-md border p-2 cursor-pointer transition-colors ${
                  selectedIds.includes(service.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Checkbox
                  checked={selectedIds.includes(service.id)}
                  onCheckedChange={() => toggle(service.id)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">
                  <span className="font-medium">{service.name}</span>
                  {service.description && (
                    <span className="block text-xs text-muted-foreground">{service.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ServiceCategoryPicker
