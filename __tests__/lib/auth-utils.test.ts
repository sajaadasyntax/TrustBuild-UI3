/**
 * Unit tests for authentication utilities
 */

import { clearAllAuthData, debugAuthState } from '@/lib/auth-utils'

describe('Auth Utils', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('clearAllAuthData', () => {
    it('should clear all authentication data from localStorage', () => {
      // Set up test data
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('refresh_token', 'test-refresh')
      localStorage.setItem('user', JSON.stringify({ id: '123' }))

      clearAllAuthData()

      const authKeys = [
        'auth_token',
        'refresh_token',
        'token',
        'user',
        'authToken',
        'accessToken',
        'refreshToken',
      ]

      authKeys.forEach(key => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(key)
        expect(sessionStorage.removeItem).toHaveBeenCalledWith(key)
      })
    })

    it('should handle being called in SSR environment', () => {
      // Temporarily remove window
      const originalWindow = global.window
      delete (global as any).window

      // Should not throw error
      expect(() => clearAllAuthData()).not.toThrow()

      // Restore window
      ;(global as any).window = originalWindow
    })

    it('should be callable multiple times safely', () => {
      clearAllAuthData()
      expect(() => clearAllAuthData()).not.toThrow()
    })
  })

  describe('debugAuthState', () => {
    it('should log auth state to console', () => {
      const consoleSpy = jest.spyOn(console, 'log')
      
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('user', JSON.stringify({ id: '123' }))

      debugAuthState()

      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should handle being called in SSR environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      expect(() => debugAuthState()).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })
})

