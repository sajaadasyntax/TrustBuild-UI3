/**
 * Unit tests for authentication utilities
 */

import { clearAllAuthData, debugAuthState } from '@/lib/auth-utils'

describe('Auth Utils', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
    ;(localStorage.clear as jest.Mock).mockClear()
    ;(localStorage.getItem as jest.Mock).mockClear()
    ;(localStorage.setItem as jest.Mock).mockClear()
    ;(localStorage.removeItem as jest.Mock).mockClear()
    ;(sessionStorage.clear as jest.Mock).mockClear()
    ;(sessionStorage.removeItem as jest.Mock).mockClear()
  })

  describe('clearAllAuthData', () => {
    it('should clear all authentication data from localStorage', () => {
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

      // Verify that removeItem was called for each auth key
      authKeys.forEach(key => {
        expect(localStorage.removeItem).toHaveBeenCalledWith(key)
        expect(sessionStorage.removeItem).toHaveBeenCalledWith(key)
      })
      
      // Should be called 7 times for each storage (7 keys)
      expect(localStorage.removeItem).toHaveBeenCalledTimes(7)
      expect(sessionStorage.removeItem).toHaveBeenCalledTimes(7)
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
      // Mock localStorage.getItem to return test values
      ;(localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'test-token'
        if (key === 'user') return JSON.stringify({ id: '123' })
        return null
      })

      debugAuthState()

      // Verify getItem was called for auth keys
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token')
      expect(localStorage.getItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorage.getItem).toHaveBeenCalledWith('user')
    })

    it('should handle being called in SSR environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      expect(() => debugAuthState()).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })
})

