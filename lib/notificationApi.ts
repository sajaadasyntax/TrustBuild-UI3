// API utilities for notifications
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk';

// Ensure we use /api prefix if not already present
const getApiUrl = (endpoint: string) => {
  const base = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
  return `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Get stored token
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// API request helper for notifications
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

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

  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'COMMISSION_DUE' | 'COMMISSION_OVERDUE' | 'SUBSCRIPTION_EXPIRING' | 'JOB_PURCHASED' | 'REVIEW_RECEIVED' | 'ACCOUNT_SUSPENDED' | 'JOB_STATUS_CHANGED' | 'JOB_STARTED' | 'JOB_COMPLETED' | 'PAYMENT_FAILED' | 'ACCOUNT_HOLD' | 'MESSAGE_RECEIVED' | 'CONTRACTOR_SELECTED' | 'FINAL_PRICE_PROPOSED' | 'FINAL_PRICE_CONFIRMATION_REMINDER';
  isRead: boolean;
  actionLink?: string;
  actionText?: string;
  metadata?: any;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Get user notifications
 */
export async function getNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationResponse> {
  const queryParams = new URLSearchParams();
  if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await apiRequest<{ status: string; data: NotificationResponse }>(`/notifications?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiRequest<{ status: string; data: { count: number } }>('/notifications/unread-count');
  return response.data.count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<Notification> {
  const response = await apiRequest<{ status: string; data: Notification }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await apiRequest('/notifications/read-all', {
    method: 'PATCH',
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  await apiRequest('/notifications', {
    method: 'DELETE',
  });
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(subscription: PushSubscription, deviceType?: string): Promise<void> {
  const subscriptionObject = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: arrayBufferToBase64(subscription.getKey('auth')!),
    },
  };

  await apiRequest('/notifications/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      subscription: subscriptionObject,
      deviceType,
    }),
  });
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  await apiRequest('/notifications/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}

/**
 * Get VAPID public key
 */
export async function getVapidPublicKey(): Promise<string> {
  const response = await apiRequest<{ status: string; data: { publicKey: string } }>('/notifications/push/public-key');
  return response.data.publicKey;
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeToPush,
  unsubscribeFromPush,
  getVapidPublicKey,
};

