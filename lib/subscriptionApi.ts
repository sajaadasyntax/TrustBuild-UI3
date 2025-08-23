// Subscription API service

import { handleApiError } from './api';

// Base API request helper that includes authentication
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Subscription API error:', error);
    throw error;
  }
};

// Subscription API methods
export const subscriptionApi = {
  // Get available subscription plans
  getPlans: async () => {
    try {
      const response = await apiRequest<{ status: string; data: { plans: any[] } }>('/subscriptions/plans');
      return response.data.plans;
    } catch (error) {
      handleApiError(error, 'Failed to fetch subscription plans');
      throw error;
    }
  },

  // Get current subscription
  getCurrentSubscription: async () => {
    try {
      const response = await apiRequest<{ status: string; data: { subscription: any; hasActiveSubscription: boolean } }>('/subscriptions/current');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch current subscription');
      throw error;
    }
  },

  // Create payment intent for subscription
  createPaymentIntent: async (plan: string) => {
    try {
      const response = await apiRequest<{ status: string; data: any }>('/subscriptions/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create payment intent');
      throw error;
    }
  },

  // Confirm subscription
  confirmSubscription: async (stripePaymentIntentId: string, plan: string) => {
    try {
      const response = await apiRequest<{ status: string; message: string; data: { subscription: any } }>('/subscriptions/confirm', {
        method: 'POST',
        body: JSON.stringify({ stripePaymentIntentId, plan }),
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to confirm subscription');
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await apiRequest<{ status: string; message: string; data: { subscription: any } }>('/subscriptions/cancel', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to cancel subscription');
      throw error;
    }
  },
};

export default subscriptionApi;
