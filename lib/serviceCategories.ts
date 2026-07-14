import { Service, servicesApi } from '@/lib/api';

/** Fallback list mirrors post-job page so labels stay consistent when API is empty. */
export const FALLBACK_SERVICES: Service[] = [
  { id: 'fallback-1', name: 'Bathroom Fitting', description: 'Complete bathroom installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-2', name: 'Bricklaying', description: 'Professional bricklaying and masonry work', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-3', name: 'Carpentry', description: 'Custom carpentry and woodworking services', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-4', name: 'Central Heating', description: 'Central heating installation and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-5', name: 'Conversions', description: 'Property conversions and structural alterations', category: 'Construction', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-6', name: 'Electrical', description: 'Electrical installation, repair and maintenance', category: 'Trade Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-7', name: 'Flooring', description: 'Floor installation, repair and refinishing', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-8', name: 'Garden Landscaping', description: 'Garden design, landscaping and maintenance', category: 'Outdoor Services', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
  { id: 'fallback-9', name: 'Kitchen Fitting', description: 'Complete kitchen installation and fitting services', category: 'Home Improvement', isActive: true, createdAt: '', updatedAt: '', smallJobPrice: 10, mediumJobPrice: 15, largeJobPrice: 20 },
];

export function isPersistedServiceId(id: string): boolean {
  return Boolean(id) && !id.startsWith('fallback-');
}

/** Load active services from the API (same source customers use when posting jobs). */
export async function fetchActiveServices(): Promise<Service[]> {
  try {
    const response = await servicesApi.getAll({ isActive: true });
    if (response?.status === 'success' && response?.data?.services) {
      const services = response.data.services.filter(
        (item: Service) => item.id && item.isActive !== false && isPersistedServiceId(item.id)
      );
      if (services.length > 0) {
        return services;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch services, using fallback list:', error);
  }
  return FALLBACK_SERVICES;
}

export function groupServicesByCategory(services: Service[]): Record<string, Service[]> {
  return services.reduce<Record<string, Service[]>>((groups, service) => {
    const category = service.category?.trim() || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {});
}

export function serviceNamesFromIds(services: Service[], ids: string[]): string {
  const names = ids
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];
  return names.join(', ');
}
