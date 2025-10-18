"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'FINANCE_ADMIN' | 'SUPPORT_ADMIN';
  permissions?: string[];
  twoFAEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getToken: () => string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

// Token management functions
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
};

const clearAllTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_temp_token');
};

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!admin;

  const getToken = (): string | null => {
    return getStoredToken();
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      
      console.log('🔐 AdminAuth: Initializing...', { hasToken: !!token });
      
      if (!token) {
        console.log('🔐 AdminAuth: No token found');
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';
        const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
        const url = `${baseUrl}/admin-auth/me`;
        
        console.log('🔐 AdminAuth: Fetching admin data from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('🔐 AdminAuth: Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('🔐 AdminAuth: Response not OK:', errorData);
          throw new Error(errorData.message || 'Authentication failed');
        }

        const data = await response.json();
        console.log('🔐 AdminAuth: Success! Admin data:', data.data.admin);
        setAdmin(data.data.admin);
      } catch (error) {
        console.error('🔐 AdminAuth: Initialization error:', error);
        clearAllTokens();
        setAdmin(null);
      } finally {
        setLoading(false);
        console.log('🔐 AdminAuth: Initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ requires2FA?: boolean; tempToken?: string }> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.trustbuild.uk/api';
      const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

      const response = await fetch(`${baseUrl}/admin-auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Check if 2FA is required
      if (result.data.requires2FA) {
        return {
          requires2FA: true,
          tempToken: result.data.tempToken
        };
      }

      // Store admin token and data
      setStoredToken(result.data.token);
      localStorage.setItem('admin_user', JSON.stringify(result.data.admin));
      setAdmin(result.data.admin);

      return {};
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint
      // const token = getStoredToken();
      // if (token) {
      //   await fetch(`${API_URL}/admin-auth/logout`, {
      //     method: 'POST',
      //     headers: { 'Authorization': `Bearer ${token}` },
      //   });
      // }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAllTokens();
      setAdmin(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
  };

  const value: AdminAuthContextType = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated,
    getToken,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  return context;
}

