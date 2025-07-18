// API configuration and utilities for TrustBuild frontend-backend communication

import { toast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
  customer?: Customer;
  contractor?: Contractor;
}

export interface Customer {
  id: string;
  userId: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  jobs?: Job[];
  reviews?: Review[];
}

export interface Contractor {
  id: string;
  userId: string;
  businessName?: string;
  description?: string;
  businessAddress?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  website?: string;
  instagramHandle?: string;
  operatingArea?: string;
  servicesProvided?: string;
  yearsExperience?: string;
  workSetup?: string;
  providesWarranty: boolean;
  warrantyPeriod?: string;
  unsatisfiedCustomers?: string;
  preferredClients?: string;
  usesContracts: boolean;
  profileApproved: boolean;
  status: string;
  tier: string;
  featuredContractor: boolean;
  jobsCompleted: number;
  averageRating: number;
  reviewCount: number;
  verifiedReviews: number;
  creditsBalance: number;
  weeklyCreditsLimit: number;
  lastCreditReset?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  services?: Service[];
  portfolio?: PortfolioItem[];
  applications?: JobApplication[];
  reviews?: Review[];
  payments?: Payment[];
  jobAccess?: JobAccess[];
  creditTransactions?: CreditTransaction[];
  subscription?: {
    status?: string;
    nextBillingDate?: string;
    freeApplicationsLeft?: number;
    amount?: number;
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  smallJobPrice: number;
  mediumJobPrice: number;
  largeJobPrice: number;
  createdAt: string;
  updatedAt: string;
  contractors?: Contractor[];
}

export interface PortfolioItem {
  id: string;
  contractorId: string;
  title: string;
  description?: string;
  imageUrl: string;
  projectDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  customerId: string;
  serviceId: string;
  title: string;
  description: string;
  budget?: number;
  location: string;
  postcode?: string;
  urgency?: string;
  status: 'DRAFT' | 'POSTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  completionDate?: string;
  isUrgent: boolean;
  requiresQuote: boolean;
  jobSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  leadPrice?: number;
  estimatedValue?: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  service: Service;
  applications?: JobApplication[];
  reviews?: Review[];
  jobAccess?: JobAccess[];
  milestones?: Milestone[];
  hasAccess?: boolean; // Computed field
  currentLeadPrice?: number; // Computed field
}

export interface JobApplication {
  id: string;
  jobId: string;
  contractorId: string;
  coverLetter?: string;
  proposedRate: number;
  timeline?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
  updatedAt: string;
  job: Job;
  contractor: Contractor;
}

export interface JobAccess {
  id: string;
  jobId: string;
  contractorId: string;
  accessMethod: 'CREDIT' | 'PAYMENT';
  paidAmount?: number;
  creditUsed: boolean;
  accessedAt: string;
  job?: Job;
  contractor?: Contractor;
  payment?: Payment;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  type: 'LEAD_ACCESS' | 'SUBSCRIPTION' | 'JOB_PAYMENT' | 'REFUND';
  description: string;
  stripePaymentId?: string;
  stripeCustomerId?: string;
  customerId?: string;
  contractorId?: string;
  jobId?: string;
  jobAccessId?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  contractor?: Contractor;
  job?: Job;
  jobAccess?: JobAccess;
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  description: string;
  recipientName: string;
  recipientEmail: string;
  recipientAddress?: string;
  pdfUrl?: string;
  issuedAt: string;
  dueAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
}

export interface CreditTransaction {
  id: string;
  contractorId: string;
  amount: number;
  type: 'WEEKLY_ALLOCATION' | 'ADMIN_ADJUSTMENT' | 'JOB_ACCESS' | 'BONUS';
  description: string;
  jobId?: string;
  adminUserId?: string;
  createdAt: string;
  contractor?: Contractor;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  contractorId: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  isExternal: boolean;
  customerName?: string;
  customerEmail?: string;
  projectType?: string;
  projectDate?: string;
  contractorResponse?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
  customer: Customer;
  contractor: Contractor;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[] & {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ContractorsPaginatedResponse {
  status: 'success';
  data: {
    contractors: Contractor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface JobsPaginatedResponse {
  status: 'success';
  data: {
    jobs: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Custom error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  // console.log("💾 Storing token:", { tokenLength: token.length, tokenStart: token.substring(0, 20) + '...' });
  localStorage.setItem('auth_token', token);
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getStoredToken();
  
  // console.log("🔍 API Request:", { endpoint, hasToken: !!token, tokenLength: token?.length });
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add any additional headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error occurred');
  }
};

// Authentication API
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'CUSTOMER' | 'CONTRACTOR';
    // Customer fields
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
    // Contractor fields
    businessName?: string;
    description?: string;
    businessAddress?: string;
    servicesProvided?: string;
    yearsExperience?: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ status: string; token: string; data: { user: User } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    setStoredToken(response.token);
    return { user: response.data.user, token: response.token };
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ status: string; token: string; data: { user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    setStoredToken(response.token);
    return { user: response.data.user, token: response.token };
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeStoredToken();
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiRequest<{ data: { token: string } }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    setStoredToken(response.data.token);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};

// Users API
export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await apiRequest<{ data: { user: User } }>('/users/me');
    return response.data.user;
  },

  updateMe: async (userData: { name?: string; email?: string }): Promise<User> => {
    const response = await apiRequest<{ data: { user: User } }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return response.data.user;
  },

  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> => {
    await apiRequest('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  },

  getAllUsers: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    return apiRequest(`/users?${searchParams.toString()}`);
  },
};

// Contractors API
export const contractorsApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    city?: string;
    service?: string;
    rating?: number;
    search?: string;
    tier?: string;
    featured?: boolean;
  } = {}): Promise<ContractorsPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/contractors?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>(`/contractors/${id}`);
    return response.data.contractor;
  },

  getMyProfile: async (): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>('/contractors/me');
    return response.data.contractor;
  },

  createProfile: async (profileData: Partial<Contractor>): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>('/contractors', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    return response.data.contractor;
  },

  updateProfile: async (profileData: Partial<Contractor>): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>('/contractors/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    return response.data.contractor;
  },

  deleteProfile: async (): Promise<void> => {
    await apiRequest('/contractors/me', { method: 'DELETE' });
  },

  addPortfolioItem: async (itemData: {
    title: string;
    description?: string;
    imageUrl: string;
    projectType?: string;
    completedAt?: string;
  }): Promise<PortfolioItem> => {
    const response = await apiRequest<{ data: { portfolioItem: PortfolioItem } }>('/contractors/me/portfolio', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return response.data.portfolioItem;
  },

  updatePortfolioItem: async (itemId: string, itemData: Partial<PortfolioItem>): Promise<PortfolioItem> => {
    const response = await apiRequest<{ data: { portfolioItem: PortfolioItem } }>(`/contractors/me/portfolio/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    });
    return response.data.portfolioItem;
  },

  deletePortfolioItem: async (itemId: string): Promise<void> => {
    await apiRequest(`/contractors/me/portfolio/${itemId}`, { method: 'DELETE' });
  },

  // Credit system
  getCredits: async (): Promise<{
    balance: number;
    weeklyLimit: number;
    resetDate: string;
    transactions: CreditTransaction[];
  }> => {
    const response = await apiRequest<{ data: any }>('/contractors/credits');
    return response.data;
  },

  getCreditTransactions: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<CreditTransaction>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/contractors/credits/transactions?${searchParams.toString()}`);
  },

  checkCreditReset: async (): Promise<{
    creditsReset: boolean;
    newBalance?: number;
    currentBalance?: number;
    nextResetDate?: string;
    message: string;
  }> => {
    const response = await apiRequest<{ data: any }>('/contractors/me/check-credit-reset', {
      method: 'POST',
    });
    return response.data;
  },

  getMyEarnings: async (): Promise<{
    totalEarnings: number;
    monthlyEarnings: number;
    pendingPayments: number;
    availableBalance: number;
    totalWithdrawn: number;
    jobsCompleted: number;
    averageJobValue: number;
    creditsBalance: number;
    weeklyCreditsLimit: number;
    nextCreditReset: string;
    subscription: any;
    recentActivity: any[];
  }> => {
    const response = await apiRequest<{ data: { earnings: any } }>('/contractors/me/earnings');
    return response.data.earnings;
  },
};

// Customers API
export const customersApi = {
  getMyProfile: async (): Promise<Customer> => {
    const response = await apiRequest<{ data: { customer: Customer } }>('/customers/me');
    return response.data.customer;
  },

  createProfile: async (profileData: {
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
  }): Promise<Customer> => {
    const response = await apiRequest<{ data: { customer: Customer } }>('/customers', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    return response.data.customer;
  },

  updateProfile: async (profileData: Partial<Customer>): Promise<Customer> => {
    const response = await apiRequest<{ data: { customer: Customer } }>('/customers/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    return response.data.customer;
  },

  getStats: async (): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    totalReviews: number;
    totalSpent: number;
    averageJobBudget: number;
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/customers/me/stats');
    return response.data.stats;
  },

  getDashboard: async (): Promise<{
    customer: Customer;
    recentJobs: Job[];
    activeJobs: Job[];
    recentReviews: Review[];
    stats: any;
  }> => {
    const response = await apiRequest<{ data: any }>('/customers/me/dashboard');
    return response.data;
  },

  getClientPaymentSummary: async (): Promise<{
    totalSpent: number;
    monthlySpent: number;
    pendingPayments: number;
    completedPayments: number;
    activeJobs: number;
    completedJobs: number;
    averageJobCost: number;
    savedPaymentMethods: number;
  }> => {
    const response = await apiRequest<{ data: { summary: any } }>('/customers/me/payment-summary');
    return response.data.summary;
  },

  getClientPaymentTransactions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return await apiRequest(`/customers/me/payments?${searchParams.toString()}`);
  },

  getClientInvoices: async (params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return await apiRequest(`/customers/me/invoices?${searchParams.toString()}`);
  },

  getClientPaymentMethods: async (): Promise<any[]> => {
    const response = await apiRequest<{ data: { paymentMethods: any[] } }>('/customers/me/payment-methods');
    return response.data.paymentMethods;
  },

  addPaymentMethod: async (paymentMethodData: any): Promise<any> => {
    const response = await apiRequest<{ data: { paymentMethod: any } }>('/customers/me/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
    return response.data.paymentMethod;
  },
};

// Jobs API
export const jobsApi = {
  // Job access and payment methods
  checkAccess: async (jobId: string): Promise<{
    hasAccess: boolean;
    leadPrice: number;
    creditsBalance: number;
    jobSize: string;
    estimatedValue?: number;
  }> => {
    const response = await apiRequest<{ data: any }>(`/jobs/${jobId}/access`);
    return response.data;
  },

  purchaseAccess: async (jobId: string, paymentMethod: 'CREDIT' | 'STRIPE'): Promise<{
    success: boolean;
    jobAccess?: JobAccess;
    paymentId?: string;
    invoiceId?: string;
  }> => {
    const response = await apiRequest<{ data: any }>(`/payments/purchase-job-access`, {
      method: 'POST',
      body: JSON.stringify({ jobId, paymentMethod }),
    });
    return { success: true, ...response.data };
  },

  getLeadPrice: async (jobId: string): Promise<{
    price: number;
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    serviceName: string;
  }> => {
    const response = await apiRequest<{ data: any }>(`/jobs/${jobId}/lead-price`);
    return response.data;
  },

  // Standard job methods
  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
    budget?: string;
    status?: string;
    search?: string;
    urgent?: boolean;
  } = {}): Promise<PaginatedResponse<Job>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/jobs?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<Job> => {
    const response = await apiRequest<{ status: string; data: Job }>(`/jobs/${id}`);
    return response.data;
  },

  create: async (jobData: {
    title: string;
    description: string;
    category: string;
    location: string;
    budget?: number;
    urgent?: boolean;
    images?: string[];
    requirements?: string;
    timeline?: string;
    contactPreference?: string;
  }): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    return response.data.job;
  },

  update: async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    });
    return response.data.job;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/jobs/${id}`, { method: 'DELETE' });
  },

  apply: async (jobId: string, applicationData: {
    proposal: string;
    estimatedCost: number;
    timeline?: string;
    questions?: string;
  }): Promise<JobApplication> => {
    const response = await apiRequest<{ data: { application: JobApplication } }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
    return response.data.application;
  },

  acceptDirectly: async (jobId: string, acceptanceData: {
    proposal: string;
    estimatedCost: number;
    timeline: string;
  }): Promise<void> => {
    await apiRequest(`/jobs/${jobId}/accept`, {
      method: 'POST',
      body: JSON.stringify(acceptanceData),
    });
  },

  getApplications: async (jobId: string): Promise<JobApplication[]> => {
    const response = await apiRequest<{ data: { applications: JobApplication[] } }>(`/jobs/${jobId}/applications`);
    return response.data.applications;
  },

  acceptApplication: async (jobId: string, applicationId: string): Promise<void> => {
    await apiRequest(`/jobs/${jobId}/applications/${applicationId}/accept`, {
      method: 'PATCH',
    });
  },

  getMyPostedJobs: async (): Promise<Job[]> => {
    const response = await apiRequest<{ data: { jobs: Job[] } }>('/jobs/my/posted');
    return response.data.jobs;
  },

  getMyApplications: async (): Promise<JobApplication[]> => {
    const response = await apiRequest<{ data: { applications: JobApplication[] } }>('/jobs/my/applications');
    return response.data.applications;
  },

  updateStatus: async (jobId: string, status: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data.job;
  },

  complete: async (jobId: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/jobs/${jobId}/complete`, {
      method: 'PATCH',
    });
    return response.data.job;
  },

  // Admin job methods
  getAllJobs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    flagged?: boolean;
  } = {}): Promise<PaginatedResponse<Job>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/jobs?${searchParams.toString()}`);
  },

  getJobStats: async (): Promise<{
    totalJobs: number;
    postedJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalValue: number;
    completedValue: number;
    successRate: number;
    recentJobs: Job[];
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/jobs/stats');
    return response.data.stats;
  },

  updateJobStatus: async (id: string, status: string, reason?: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/admin/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response.data.job;
  },

  toggleJobFlag: async (id: string, flagged: boolean, reason?: string): Promise<void> => {
    await apiRequest(`/admin/jobs/${id}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ flagged, reason }),
    });
  },
};

// Reviews API
export const reviewsApi = {
  getContractorReviews: async (contractorId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Review> & { averageRating: number }> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    return apiRequest(`/reviews/contractor/${contractorId}?${searchParams.toString()}`);
  },

  create: async (reviewData: {
    jobId: string;
    contractorId: string;
    rating: number;
    comment?: string;
    title?: string;
  }): Promise<Review> => {
    const response = await apiRequest<{ data: { review: Review } }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    return response.data.review;
  },

  update: async (id: string, reviewData: {
    rating?: number;
    comment?: string;
    title?: string;
  }): Promise<Review> => {
    const response = await apiRequest<{ data: { review: Review } }>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
    return response.data.review;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/reviews/${id}`, { method: 'DELETE' });
  },

  respond: async (id: string, response: string): Promise<Review> => {
    const responseData = await apiRequest<{ data: { review: Review } }>(`/reviews/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
    return responseData.data.review;
  },

  getMyGiven: async (): Promise<Review[]> => {
    const response = await apiRequest<{ data: { reviews: Review[] } }>('/reviews/my/given');
    return response.data.reviews;
  },

  getMyReceived: async (): Promise<Review[]> => {
    const response = await apiRequest<{ data: { reviews: Review[] } }>('/reviews/my/received');
    return response.data.reviews;
  },

  flag: async (id: string, reason: string): Promise<void> => {
    await apiRequest(`/reviews/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Services API
export const servicesApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
  } = {}): Promise<PaginatedResponse<Service>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/services?${searchParams.toString()}`);
  },

  getById: async (id: string): Promise<Service> => {
    const response = await apiRequest<{ data: { service: Service } }>(`/services/${id}`);
    return response.data.service;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiRequest<{ data: { categories: string[] } }>('/services/categories');
    return response.data.categories;
  },

  getContractorsForService: async (serviceId: string, params: {
    page?: number;
    limit?: number;
    location?: string;
    rating?: number;
    tier?: string;
  } = {}): Promise<ContractorsPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/services/${serviceId}/contractors?${searchParams.toString()}`);
  },
};

// Admin API
export const adminApi = {
  // Dashboard and Analytics
  getDashboardStats: async (): Promise<{
    users: { total: number; active: number; inactive: number };
    contractors: { total: number; approved: number; pending: number };
    customers: { total: number };
    jobs: { total: number; active: number; completed: number };
    reviews: { total: number; flagged: number };
    applications: { total: number; pending: number };
    services: { total: number; active: number };
    revenue: { total: number };
    recent: { users: User[]; jobs: Job[] };
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/dashboard');
    return response.data.stats;
  },

  getAnalytics: async (period: string = '30'): Promise<{
    userGrowth: any[];
    jobTrends: any[];
    popularServices: any[];
    topContractors: any[];
    revenueByPeriod: any[];
  }> => {
    const response = await apiRequest<{ data: { analytics: any } }>(`/admin/analytics?period=${period}`);
    return response.data.analytics;
  },

  // User Management
  getAllUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<User>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/users?${searchParams.toString()}`);
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiRequest<{ data: { user: User } }>(`/admin/users/${id}`);
    return response.data.user;
  },

  createAdmin: async (adminData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> => {
    const response = await apiRequest<{ data: { user: User } }>('/admin/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return response.data.user;
  },

  manageUser: async (id: string, action: 'activate' | 'deactivate' | 'delete'): Promise<void> => {
    await apiRequest(`/admin/users/${id}/manage`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  },

  // Contractor Management
  getAllContractors: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    approved?: string;
    search?: string;
  } = {}): Promise<ContractorsPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/contractors?${searchParams.toString()}`);
  },

  getPendingContractors: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ContractorsPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/contractors/pending?${searchParams.toString()}`);
  },

  approveContractor: async (id: string, approved: boolean, reason?: string, notes?: string): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>(`/admin/contractors/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason, notes }),
    });
    return response.data.contractor;
  },

  // Contractor status management
  updateContractorStatus: async (id: string, status: string, reason?: string): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>(`/admin/contractors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response.data.contractor;
  },

  // Get contractor statistics
  getContractorStats: async (): Promise<{
    totalContractors: number;
    activeContractors: number;
    suspendedContractors: number;
    pendingApproval: number;
    verifiedContractors: number;
    premiumContractors: number;
    standardContractors: number;
    completionRate: number;
    approvalRate: number;
    recentContractors: any[];
    topRatedContractors: any[];
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/contractors/stats');
    return response.data.stats;
  },

  // Legacy approve route (for backward compatibility)
  approveContractorLegacy: async (id: string, approved: boolean, reason?: string): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>(`/admin/contractors/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason }),
    });
    return response.data.contractor;
  },

  // Job Management
  getAllJobs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    category?: string;
    flagged?: boolean;
  } = {}): Promise<JobsPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/jobs?${searchParams.toString()}`);
  },

  getJobStats: async (): Promise<{
    totalJobs: number;
    postedJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalValue: number;
    completedValue: number;
    successRate: number;
    recentJobs: any[];
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/jobs/stats');
    return response.data.stats;
  },

  updateJobStatus: async (jobId: string, status: string, reason?: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job }; message: string }>(`/admin/jobs/${jobId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response.data.job;
  },

  toggleJobFlag: async (jobId: string, flagged: boolean, reason?: string): Promise<void> => {
    await apiRequest<{ status: string; message: string }>(`/admin/jobs/${jobId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ flagged, reason }),
    });
  },

  // Content Moderation
  getFlaggedContent: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    severity?: string;
    search?: string;
  } = {}): Promise<{
    content: any[];
    stats: {
      totalFlagged: number;
      pendingReview: number;
      approved: number;
      rejected: number;
      highSeverity: number;
      mediumSeverity: number;
      lowSeverity: number;
      reviewCount: number;
      jobCount: number;
      profileCount: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    const response = await apiRequest<{ data: any }>(`/admin/content/flagged?${searchParams.toString()}`);
    return response.data;
  },

  moderateContent: async (type: string, id: string, action: 'approve' | 'reject' | 'delete', reason?: string): Promise<void> => {
    await apiRequest(`/admin/content/${type}/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  },

  // Payment Settings
  getSystemSettings: async (): Promise<Record<string, string>> => {
    const response = await apiRequest<{ data: { settings: Record<string, string> } }>('/admin/payments/settings');
    return response.data.settings;
  },

  updateSystemSettings: async (settings: Record<string, string>): Promise<void> => {
    await apiRequest('/admin/payments/settings', {
      method: 'PATCH',
      body: JSON.stringify({ settings }),
    });
  },

  // Payment Management APIs
  getPaymentStats: async (): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageTransactionValue: number;
    revenueGrowth: number;
    subscriptionRevenue: number;
    jobPaymentRevenue: number;
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/payments/stats');
    return response.data.stats;
  },

  getPaymentTransactions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  } = {}): Promise<{
    status: 'success';
    data: {
      transactions: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    const response = await apiRequest<{
      status: 'success';
      data: {
        transactions: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/admin/payments/transactions?${searchParams.toString()}`);
    return response;
  },

  processRefund: async (paymentId: string, amount: number, reason: string): Promise<any> => {
    const response = await apiRequest<{ data: { refund: any } }>(`/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
    return response.data.refund;
  },

  // Payment and pricing management
  updateServicePricing: async (serviceId: string, pricing: {
    smallJobPrice: number;
    mediumJobPrice: number;
    largeJobPrice: number;
  }): Promise<Service> => {
    const response = await apiRequest<{ data: { service: Service } }>(`/admin/services/${serviceId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(pricing),
    });
    return response.data.service;
  },

  // Admin credit management
  adjustContractorCredits: async (contractorId: string, amount: number, reason: string): Promise<{
    success: boolean;
    newBalance: number;
    transaction: CreditTransaction;
  }> => {
    const response = await apiRequest<{ data: any }>(`/admin/contractors/${contractorId}/credits`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, reason }),
    });
    return response.data;
  },

  // Job pricing override
  setJobLeadPrice: async (jobId: string, price: number, reason?: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/admin/jobs/${jobId}/lead-price`, {
      method: 'PATCH',
      body: JSON.stringify({ price, reason }),
    });
    return response.data.job;
  },

  // Weekly credit reset for all contractors
  resetWeeklyCredits: async (): Promise<{
    resetCount: number;
    message: string;
  }> => {
    const response = await apiRequest<{ data: any }>('/contractors/reset-weekly-credits', {
      method: 'POST',
    });
    return response.data;
  },

  // Get services with pricing
  getServicesWithPricing: async (): Promise<{
    services: Array<Service & { _count: { jobs: number } }>;
  }> => {
    const response = await apiRequest<{ data: any }>('/admin/payments/services');
    return response.data;
  },

  // Payment analytics
  getPaymentOverview: async (): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageTransactionValue: number;
    revenueGrowth: number;
    subscriptionRevenue: number;
    jobPaymentRevenue: number;
  }> => {
    const response = await apiRequest<{ data: any }>('/admin/payment-overview');
    return response.data;
  },
  
  searchContractors: (query: string, page = 1, limit = 10) => 
    apiRequest<any>(`/admin/contractors-search?query=${query}&page=${page}&limit=${limit}`),
};

// Payment API
export const paymentsApi = {
  getMyPayments: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {}): Promise<PaginatedResponse<Payment>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/payments/my?${searchParams.toString()}`);
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await apiRequest<{ data: { payment: Payment } }>(`/payments/${paymentId}`);
    return response.data.payment;
  },

  createStripePaymentIntent: async (amount: number, description: string, metadata?: any): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> => {
    const response = await apiRequest<{ data: any }>('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, description, metadata }),
    });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, paymentMethodId: string): Promise<{
    success: boolean;
    payment?: Payment;
  }> => {
    const response = await apiRequest<{ data: any }>('/payments/stripe/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });
    return response.data;
  },

  checkJobAccess: (jobId: string) => apiRequest<any>(`/payments/job-access/${jobId}`),
  
  purchaseJobAccess: (data: { jobId: string; paymentMethod: 'CREDIT' | 'STRIPE'; stripePaymentIntentId?: string }) =>
    apiRequest<any>('/payments/purchase-job-access', { method: 'POST', body: JSON.stringify(data) }),
    
  createPaymentIntent: (jobId: string) => 
    apiRequest<any>('/payments/create-payment-intent', { method: 'POST', body: JSON.stringify({ jobId }) }),
    
  getPaymentHistory: (page = 1, limit = 10) => 
    apiRequest<any>(`/payments/history?page=${page}&limit=${limit}`),
    
  getCreditHistory: (page = 1, limit = 10) => 
    apiRequest<any>(`/payments/credit-history?page=${page}&limit=${limit}`),
};

// Invoice API
export const invoicesApi = {
  getMyInvoices: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Invoice>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/invoices/my?${searchParams.toString()}`);
  },

  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const response = await apiRequest<{ data: { invoice: Invoice } }>(`/invoices/${invoiceId}`);
    return response.data.invoice;
  },

  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const response = await fetch(`/api/invoices/${invoiceId}/download`, {
      headers: {
        'Authorization': `Bearer ${getStoredToken()}`,
      },
    });
    return response.blob();
  },

  generateInvoice: async (paymentId: string): Promise<Invoice> => {
    const response = await apiRequest<{ data: { invoice: Invoice } }>(`/payments/${paymentId}/invoice`, {
      method: 'POST',
    });
    return response.data.invoice;
  },

  getInvoices: (page = 1, limit = 10) => apiRequest<any>(`/invoices?page=${page}&limit=${limit}`),
  
  getInvoice: (invoiceId: string) => apiRequest<any>(`/invoices/${invoiceId}`),
  
  sendInvoiceEmail: (invoiceId: string) => apiRequest<void>(`/invoices/${invoiceId}/send`, { method: 'POST' }),
  
  getInvoiceStats: (period = '30') => apiRequest<any>(`/invoices/stats?period=${period}`),
};

// Job Management - methods merged above in main jobsApi

export const jobManagementApi = {
  getAllJobs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    category?: string;
    flagged?: boolean;
  } = {}): Promise<PaginatedResponse<Job>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/admin/jobs?${searchParams.toString()}`);
  },

  getJobStats: async (): Promise<{
    totalJobs: number;
    postedJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalValue: number;
    completedValue: number;
    successRate: number;
    recentJobs: Job[];
  }> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/jobs/stats');
    return response.data.stats;
  },

  updateJobStatus: async (id: string, status: string, reason?: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/admin/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    return response.data.job;
  },

  toggleJobFlag: async (id: string, flagged: boolean, reason?: string): Promise<void> => {
    await apiRequest(`/admin/jobs/${id}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ flagged, reason }),
    });
  },

  // Contractor Payment APIs
  getContractorEarnings: async (): Promise<{
    totalEarnings: number;
    monthlyEarnings: number;
    pendingPayments: number;
    availableBalance: number;
    totalWithdrawn: number;
    subscriptionCost: number;
    subscriptionStatus: string;
    nextBillingDate: string;
    jobsCompleted: number;
    averageJobValue: number;
  }> => {
    const response = await apiRequest<{ data: { earnings: any } }>('/contractors/earnings');
    return response.data.earnings;
  },

  // Credit system
  getCredits: async (): Promise<{
    balance: number;
    weeklyLimit: number;
    resetDate: string;
    transactions: CreditTransaction[];
  }> => {
    const response = await apiRequest<{ data: any }>('/contractors/credits');
    return response.data;
  },

  getCreditTransactions: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<CreditTransaction>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    return apiRequest(`/contractors/credits/transactions?${searchParams.toString()}`);
  },

  // Service pricing management
  updateServicePricing: async (serviceId: string, pricing: {
    smallJobPrice: number;
    mediumJobPrice: number;
    largeJobPrice: number;
  }): Promise<Service> => {
    const response = await apiRequest<{ data: { service: Service } }>(`/admin/services/${serviceId}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(pricing),
    });
    return response.data.service;
  },

  // Admin credit management
  adjustContractorCredits: async (contractorId: string, amount: number, reason: string): Promise<{
    success: boolean;
    newBalance: number;
    transaction: CreditTransaction;
  }> => {
    const response = await apiRequest<{ data: any }>(`/admin/contractors/${contractorId}/credits`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, reason }),
    });
    return response.data;
  },

  // Job pricing override
  setJobLeadPrice: async (jobId: string, price: number, reason?: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/admin/jobs/${jobId}/lead-price`, {
      method: 'PATCH',
      body: JSON.stringify({ price, reason }),
    });
    return response.data.job;
  },

  getContractorTransactions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  } = {}): Promise<{
    status: 'success';
    data: {
      transactions: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    
    const response = await apiRequest<{
      status: 'success';
      data: {
        transactions: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/contractors/transactions?${searchParams.toString()}`);
    return response;
  },

  requestWithdrawal: async (amount: number): Promise<any> => {
    const response = await apiRequest<{ data: { withdrawal: any } }>('/contractors/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return response.data.withdrawal;
  },


};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File): Promise<{ url: string; cloudinaryId?: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(response.status, data.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  },

  uploadMultiple: async (files: File[]): Promise<{ urls: string[]; cloudinaryIds?: string[] }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(response.status, data.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  },
};

// Milestones API
export const milestonesApi = {
  getJobMilestones: async (jobId: string): Promise<Milestone[]> => {
    const response = await apiRequest<{ data: Milestone[] }>(`/jobs/${jobId}/milestones`);
    return response.data;
  },

  createJobMilestone: async (jobId: string, milestone: {
    title: string;
    description?: string;
    dueDate?: string;
  }): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(`/jobs/${jobId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestone),
    });
    return response.data;
  },

  updateJobMilestone: async (jobId: string, milestoneId: string, updates: {
    title?: string;
    description?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
  }): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(`/jobs/${jobId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  deleteJobMilestone: async (jobId: string, milestoneId: string): Promise<void> => {
    await apiRequest(`/jobs/${jobId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  },
};

// Utility function for handling API errors with toast notifications
export const handleApiError = (error: unknown, fallbackMessage = 'An error occurred') => {
  if (error instanceof ApiError) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Error',
      description: fallbackMessage,
      variant: 'destructive',
    });
  }
  console.error('API Error:', error);
}; 