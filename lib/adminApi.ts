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

  // Get all users with filters and pagination
  getAllUsers: async (params?: { 
    page?: number; 
    limit?: number; 
    role?: string;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await adminApiRequest<any>(`/admin/users?${queryParams}`);
    return response;
  },

  // Manage user (activate, deactivate, delete)
  manageUser: async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    const response = await adminApiRequest<any>(`/admin/users/${userId}/${action}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
    });
    return response;
  },

  // Get all contractors with filters
  getAllContractors: async (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await adminApiRequest<any>(`/admin/contractors?${queryParams}`);
    return response;
  },

  // Get pending contractors
  getPendingContractors: async (params?: { limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await adminApiRequest<any>(`/admin/contractors/pending?${queryParams}`);
    return response;
  },

  // Get contractor statistics
  getContractorStats: async () => {
    const response = await adminApiRequest<any>('/admin/contractors/stats');
    return response;
  },

  // Approve/reject contractor
  approveContractor: async (contractorId: string, approved: boolean, reason?: string) => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason }),
    });
    return response;
  },

  // Update contractor status
  updateContractorStatus: async (contractorId: string, status: string, reason?: string) => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response;
  },

  // Adjust contractor credits
  adjustContractorCredits: async (contractorId: string, amount: number, reason: string) => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/credits`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, reason }),
    });
    return response;
  },

  // Get all jobs with filters
  getAllJobs: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/jobs?${queryParams}`);
    return response;
  },

  // Get job statistics
  getJobStats: async () => {
    const response = await adminApiRequest<any>('/admin/jobs/stats');
    return response;
  },

  // Update job status
  updateJobStatus: async (jobId: string, status: string, reason?: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response;
  },

  // Toggle job flag
  toggleJobFlag: async (jobId: string, flagged: boolean, reason?: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ flagged, reason }),
    });
    return response;
  },

  // Set job lead price
  setJobLeadPrice: async (jobId: string, leadPrice: number) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/lead-price`, {
      method: 'PATCH',
      body: JSON.stringify({ leadPrice }),
    });
    return response;
  },

  // Set job budget
  setJobBudget: async (jobId: string, budget: number) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/budget`, {
      method: 'PATCH',
      body: JSON.stringify({ budget }),
    });
    return response;
  },

  // Update job contractor limit
  updateJobContractorLimit: async (jobId: string, limit: number) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/contractor-limit`, {
      method: 'PATCH',
      body: JSON.stringify({ limit }),
    });
    return response;
  },

  // Assign contractor to job
  assignContractorToJob: async (jobId: string, contractorId: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ contractorId }),
    });
    return response;
  },

  // Admin override final price
  adminOverrideFinalPrice: async (jobId: string, finalAmount: number, reason: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/override-final-price`, {
      method: 'POST',
      body: JSON.stringify({ finalAmount, reason }),
    });
    return response;
  },

  // Get jobs awaiting final price confirmation
  getJobsAwaitingFinalPriceConfirmation: async () => {
    const response = await adminApiRequest<any>('/admin/jobs/awaiting-final-price');
    return response;
  },

  // Get all reviews
  getAllReviews: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/reviews?${queryParams}`);
    return response;
  },

  // Moderate content
  moderateContent: async (type: string, id: string, data: any) => {
    const response = await adminApiRequest<any>(`/admin/content/${type}/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Get payment statistics
  getPaymentStats: async () => {
    const response = await adminApiRequest<any>('/admin/payments/stats');
    return response;
  },

  // Get payment transactions
  getPaymentTransactions: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/payments/transactions?${queryParams}`);
    return response;
  },

  // Get invoices
  getInvoices: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/invoices?${queryParams}`);
    return response;
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId: string) => {
    const response = await adminApiRequest<any>(`/admin/invoices/${invoiceId}`);
    return response;
  },

  // Update invoice status
  updateInvoiceStatus: async (invoiceId: string, status: string) => {
    const response = await adminApiRequest<any>(`/admin/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response;
  },

  // Send invoice email
  sendInvoiceEmail: async (invoiceId: string) => {
    const response = await adminApiRequest<any>(`/admin/invoices/${invoiceId}/send-email`, {
      method: 'POST',
    });
    return response;
  },

  // Download invoice
  downloadInvoice: async (invoiceId: string) => {
    const token = getAdminToken();
    const url = `${BASE_URL}/admin/invoices/${invoiceId}/download`;
    window.open(`${url}?token=${token}`, '_blank');
  },

  // Get all services
  getAll: async () => {
    const response = await adminApiRequest<any>('/admin/services');
    return response;
  },

  // Update service pricing
  updateServicePricing: async (serviceId: string, pricing: any) => {
    const response = await adminApiRequest<any>(`/admin/services/${serviceId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(pricing),
    });
    return response;
  },
};

export default adminApi;

