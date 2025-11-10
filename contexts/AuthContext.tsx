"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

const clearAllTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  // Also clear any other auth-related items
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Use the usersApi.getMe() to get current user
        const userData = await usersApi.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Clear all tokens on ANY auth error (malformed JWT, 401, 500, etc.)
        clearAllTokens();
        setUser(null);
        
        // Force reload the page to clear any cached state
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // The authApi.login already handles token storage
      // console.log("🔐 Login successful, setting user:", response.user);
      setUser(response.user);
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