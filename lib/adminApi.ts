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
  getActivityLogs: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/activity/logs?${queryParams}`);
    return response;
  },

  // Get activity statistics
  getActivityStats: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/activity/stats?${queryParams}`);
    return response;
  },

  // Get login activities
  getLoginActivities: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/activity/logins?${queryParams}`);
    return response;
  },

  // Email Logs
  getEmailLogs: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/email/logs?${queryParams}`);
    return response;
  },

  getEmailStats: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/email/stats?${queryParams}`);
    return response;
  },

  // Error Logs
  getErrorLogs: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/errors/logs?${queryParams}`);
    return response;
  },

  getErrorStats: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/errors/stats?${queryParams}`);
    return response;
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
  approveContractor: async (contractorId: string, approved: boolean, reason?: string, bypassKyc?: boolean) => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason, bypassKyc }),
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

  // Get contractor credits and transactions
  getContractorCredits: async (contractorId: string) => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/credits`);
    return response;
  },

  // Adjust contractor credits
  adjustContractorCredits: async (contractorId: string, amount: number, reason: string, type: 'ADDITION' | 'DEDUCTION') => {
    const response = await adminApiRequest<any>(`/admin/contractors/${contractorId}/adjust-credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason, type }),
    });
    return response;
  },

  // Get all jobs with filters
  getAllJobs: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/jobs?${queryParams}`);
    return response;
  },

  // Get job by ID
  getJobById: async (jobId: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}`);
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
  updateJobContractorLimit: async (jobId: string, maxContractorsPerJob: number, reason: string) => {
    const response = await adminApiRequest<any>(`/admin/jobs/${jobId}/contractor-limit`, {
      method: 'PATCH',
      body: JSON.stringify({ maxContractorsPerJob, reason }),
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

  // Flag content
  flagContent: async (type: string, id: string, reason: string) => {
    const response = await adminApiRequest<any>(`/admin/content/${type}/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response;
  },

  // Get payment statistics
  getPaymentStats: async () => {
    const response = await adminApiRequest<any>('/admin/payments/stats');
    return response.data?.stats || response.data || response;
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
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }
    const token = getAdminToken();
    if (!token) {
      throw new Error('Admin authentication required');
    }
    const url = `${BASE_URL}/admin/invoices/${invoiceId}/download`;
    // Use fetch with Authorization header instead of query param for security
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    
    // Get the blob and create download link
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
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

  // Support Tickets
  getSupportTickets: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/support-tickets?${queryParams}`);
    return response;
  },

  getSupportTicketStats: async () => {
    const response = await adminApiRequest<any>('/admin/support-tickets/stats');
    return response;
  },

  getSupportTicketById: async (ticketId: string) => {
    const response = await adminApiRequest<any>(`/admin/support-tickets/${ticketId}`);
    return response;
  },

  createSupportTicket: async (ticketData: any) => {
    const response = await adminApiRequest<any>('/admin/support-tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    return response;
  },

  updateSupportTicketStatus: async (ticketId: string, status: string) => {
    const response = await adminApiRequest<any>(`/admin/support-tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response;
  },

  assignSupportTicket: async (ticketId: string, assignee?: string, assigneeId?: string) => {
    const response = await adminApiRequest<any>(`/admin/support-tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignee, assigneeId }),
    });
    return response;
  },

  addSupportTicketResponse: async (ticketId: string, message: string, isInternal: boolean = false) => {
    const response = await adminApiRequest<any>(`/admin/support-tickets/${ticketId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ message, isInternal }),
    });
    return response;
  },

  // Chat/Conversations
  getConversations: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/messages/conversations?${queryParams}`);
    return response;
  },

  getConversationWithUser: async (userId: string) => {
    const response = await adminApiRequest<any>(`/admin/messages/conversation/${userId}`);
    return response;
  },

  sendMessage: async (recipientId: string, content: string, subject?: string) => {
    const response = await adminApiRequest<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, subject }),
    });
    return response;
  },

  // Manual Invoices
  getManualInvoices: async (params?: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await adminApiRequest<any>(`/admin/manual-invoices?${queryParams}`);
    return response;
  },

  getManualInvoiceById: async (invoiceId: string) => {
    const response = await adminApiRequest<any>(`/admin/manual-invoices/${invoiceId}`);
    return response;
  },

  createManualInvoice: async (invoiceData: any) => {
    const response = await adminApiRequest<any>('/admin/manual-invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return response;
  },

  issueManualInvoice: async (invoiceId: string) => {
    const response = await adminApiRequest<any>(`/admin/manual-invoices/${invoiceId}/issue`, {
      method: 'POST',
    });
    return response;
  },

  sendManualInvoiceReminder: async (invoiceId: string) => {
    const response = await adminApiRequest<any>(`/admin/manual-invoices/${invoiceId}/remind`, {
      method: 'POST',
    });
    return response;
  },

  recordManualInvoicePayment: async (invoiceId: string, notes?: string) => {
    const response = await adminApiRequest<any>(`/admin/manual-invoices/${invoiceId}/record-payment`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return response;
  },

  cancelManualInvoice: async (invoiceId: string, reason: string) => {
    const response = await adminApiRequest<any>(`/admin/manual-invoices/${invoiceId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response;
  },
};

export default adminApi;

