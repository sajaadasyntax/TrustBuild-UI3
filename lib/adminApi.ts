// Admin API Client
// Separate from regular user API to handle admin-specific authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';
const BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

// Get admin token from localStorage
const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

// Make API request with admin authentication
async function adminApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();
  
  console.log(`🌐 AdminAPI: Request to ${endpoint}`, { hasToken: !!token });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('🌐 AdminAPI: No token available for request');
  }

  const url = `${BASE_URL}${endpoint}`;
  
  console.log(`🌐 AdminAPI: Fetching ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`🌐 AdminAPI: Response status ${response.status} for ${endpoint}`);

  const data = await response.json();
  
  console.log(`🌐 AdminAPI: Response data for ${endpoint}:`, data);

  if (!response.ok) {
    console.error(`🌐 AdminAPI: Error response:`, data);
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Admin API endpoints
export const adminApi = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await adminApiRequest<any>('/admin/dashboard');
    console.log('🎯 getDashboardStats: Returning', response.data?.stats || response.data || response);
    return response.data?.stats || response.data || response;
  },

  // Get admin profile
  getProfile: async () => {
    const response = await adminApiRequest<any>('/admin-auth/me');
    return response.data.admin;
  },

  // List all admins (Super Admin only)
  listAdmins: async () => {
    const response = await adminApiRequest<any>('/admin-auth/admins');
    return response.data.admins;
  },

  // Create admin (Super Admin only)
  createAdmin: async (adminData: {
    email: string;
    name: string;
    role: string;
    password: string;
    permissions?: string[];
  }) => {
    const response = await adminApiRequest<any>('/admin-auth/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return response.data.admin;
  },

  // Update admin (Super Admin only)
  updateAdmin: async (id: string, updates: any) => {
    const response = await adminApiRequest<any>(`/admin-auth/admins/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data.admin;
  },

  // Delete admin (Super Admin only)
  deleteAdmin: async (id: string) => {
    const response = await adminApiRequest<any>(`/admin-auth/admins/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await adminApiRequest<any>('/admin-auth/2fa/enable', {
      method: 'POST',
    });
    return response.data;
  },

  // Verify 2FA setup
  verify2FASetup: async (token: string) => {
    const response = await adminApiRequest<any>('/admin-auth/2fa/verify-setup', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response;
  },

  // Disable 2FA
  disable2FA: async (password: string) => {
    const response = await adminApiRequest<any>('/admin-auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return response;
  },

  // Get activity logs
  getActivityLogs: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await adminApiRequest<any>(`/admin-activity/logs?${queryParams}`);
    return response.data;
  },

  // Get login activities
  getLoginActivities: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await adminApiRequest<any>(`/admin-activity/login-activities?${queryParams}`);
    return response.data;
  },
};

export default adminApi;

