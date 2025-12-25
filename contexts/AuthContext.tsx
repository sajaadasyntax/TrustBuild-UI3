"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { authApi, usersApi, ApiError, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Internal token management functions (similar to what's in api.ts)
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

const clearAllTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  // Also clear any other auth-related items
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Parse JWT token to get expiration time
const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
};

// Check if token will expire soon (within 30 minutes)
const isTokenExpiringSoon = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  const thirtyMinutes = 30 * 60 * 1000;
  return Date.now() > expiration - thirtyMinutes;
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() > expiration;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const isAuthenticated = !!user;

  // Refresh token function
  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    
    const token = getStoredToken();
    if (!token) return false;

    // Don't refresh if token is already expired
    if (isTokenExpired(token)) {
      console.log('🔄 Token expired, cannot refresh');
      return false;
    }

    isRefreshingRef.current = true;
    
    try {
      console.log('🔄 Refreshing auth token...');
      const response = await authApi.refreshToken();
      if (response.token) {
        setStoredToken(response.token);
        console.log('✅ Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const token = getStoredToken();
    if (!token) return;

    // Check and refresh token every 5 minutes
    refreshIntervalRef.current = setInterval(async () => {
      const currentToken = getStoredToken();
      if (!currentToken) {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        return;
      }

      // Refresh if token expires within 30 minutes
      if (isTokenExpiringSoon(currentToken)) {
        const success = await refreshAuthToken();
        if (!success && isTokenExpired(currentToken)) {
          // Token expired and refresh failed - logout
          console.log('🚪 Token expired and refresh failed, logging out');
          clearAllTokens();
          setUser(null);
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }, [refreshAuthToken]);

  // Handle user activity - refresh token when user is actively using the app
  const handleUserActivity = useCallback(() => {
    const token = getStoredToken();
    if (!token || !user) return;
    
    // If token is expiring soon and user is active, refresh it
    if (isTokenExpiringSoon(token) && !isRefreshingRef.current) {
      refreshAuthToken();
    }
  }, [user, refreshAuthToken]);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('🔄 Token expired on load, clearing session');
        clearAllTokens();
        setLoading(false);
        return;
      }

      try {
        // If token is expiring soon, try to refresh it first
        if (isTokenExpiringSoon(token)) {
          await refreshAuthToken();
        }

        // Use the usersApi.getMe() to get current user
        const userData = await usersApi.getMe();
        setUser(userData);
        
        // Setup automatic token refresh
        setupTokenRefresh();
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Only clear tokens on 401 errors, not on network errors
        if (error instanceof ApiError && error.status === 401) {
          clearAllTokens();
          setUser(null);
        } else {
          // For other errors (network, 500, etc.), keep the token and try again later
          console.warn('Non-auth error during initialization, keeping session');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshAuthToken, setupTokenRefresh]);

  // Listen for user activity to keep session alive
  useEffect(() => {
    if (!user) return;

    // Throttled activity handler - only process once per minute
    let lastActivityTime = Date.now();
    const throttledHandler = () => {
      const now = Date.now();
      if (now - lastActivityTime > 60000) { // 1 minute throttle
        lastActivityTime = now;
        handleUserActivity();
      }
    };

    // Listen for user interaction events
    window.addEventListener('click', throttledHandler);
    window.addEventListener('keydown', throttledHandler);
    window.addEventListener('scroll', throttledHandler);
    window.addEventListener('mousemove', throttledHandler);

    // Also refresh on visibility change (when tab becomes active)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = getStoredToken();
        if (token && isTokenExpiringSoon(token)) {
          refreshAuthToken();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('click', throttledHandler);
      window.removeEventListener('keydown', throttledHandler);
      window.removeEventListener('scroll', throttledHandler);
      window.removeEventListener('mousemove', throttledHandler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, handleUserActivity, refreshAuthToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // The authApi.login already handles token storage
      setUser(response.user);
      
      // Setup automatic token refresh after successful login
      setupTokenRefresh();
    } catch (error) {
      throw error; // Re-throw to let components handle the error
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all tokens and user state
      clearAllTokens();
      setUser(null);
      // Redirect to login page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    setUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 