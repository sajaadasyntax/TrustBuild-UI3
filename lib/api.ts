// API configuration and utilities for TrustBuild frontend-backend communication

import { toast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'CONTRACTOR' | 'ADMIN';
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
  createdAt: string;
  updatedAt: string;
  user: User;
  services?: Service[];
  portfolio?: PortfolioItem[];
  applications?: JobApplication[];
  reviews?: Review[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
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

export interface Job {
  id: string;
  customerId: string;
  serviceId: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  postcode?: string;
  urgency?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  completionDate?: string;
  isUrgent: boolean;
  requiresQuote: boolean;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  service: Service;
  applications?: JobApplication[];
  reviews?: Review[];
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
  createdAt: string;
  updatedAt: string;
  job: Job;
  customer: Customer;
  contractor: Contractor;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    [key: string]: T[];
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
    role: 'CUSTOMER' | 'CONTRACTOR';
  }): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    setStoredToken(response.data.token);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    setStoredToken(response.data.token);
    return response.data;
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
  } = {}): Promise<PaginatedResponse<Contractor>> => {
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
    recentJobs: Job[];
    activeJobs: Job[];
    recentReviews: Review[];
    stats: any;
  }> => {
    const response = await apiRequest<{ data: any }>('/customers/me/dashboard');
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
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
    const response = await apiRequest<{ data: { job: Job } }>(`/jobs/${id}`);
    return response.data.job;
  },

  create: async (jobData: {
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
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

  complete: async (jobId: string): Promise<Job> => {
    const response = await apiRequest<{ data: { job: Job } }>(`/jobs/${jobId}/complete`, {
      method: 'PATCH',
    });
    return response.data.job;
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
  } = {}): Promise<PaginatedResponse<Contractor>> => {
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
  getDashboardStats: async (): Promise<any> => {
    const response = await apiRequest<{ data: { stats: any } }>('/admin/dashboard');
    return response.data.stats;
  },

  getAnalytics: async (period: number = 30): Promise<any> => {
    const response = await apiRequest<{ data: { analytics: any } }>(`/admin/analytics?period=${period}`);
    return response.data.analytics;
  },

  getPendingContractors: async (params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Contractor>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    return apiRequest(`/admin/contractors/pending?${searchParams.toString()}`);
  },

  approveContractor: async (id: string, approved: boolean, reason?: string): Promise<Contractor> => {
    const response = await apiRequest<{ data: { contractor: Contractor } }>(`/admin/contractors/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason }),
    });
    return response.data.contractor;
  },

  getFlaggedContent: async (): Promise<any> => {
    const response = await apiRequest<{ data: any }>('/admin/content/flagged');
    return response.data;
  },

  moderateContent: async (type: string, id: string, action: 'approve' | 'reject' | 'delete', reason?: string): Promise<void> => {
    await apiRequest(`/admin/content/${type}/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  },

  manageUser: async (id: string, action: 'activate' | 'deactivate' | 'delete'): Promise<void> => {
    await apiRequest(`/admin/users/${id}/manage`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  },

  getSettings: async (): Promise<Record<string, string>> => {
    const response = await apiRequest<{ data: { settings: Record<string, string> } }>('/admin/settings');
    return response.data.settings;
  },

  updateSettings: async (settings: Record<string, string>): Promise<void> => {
    await apiRequest('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ settings }),
    });
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