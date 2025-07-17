/**
 * Utility functions for authentication management
 */

export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear all possible auth-related localStorage items
  const authKeys = [
    'auth_token',
    'refresh_token', 
    'token',
    'user',
    'authToken',
    'accessToken',
    'refreshToken'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage
  authKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log('All authentication data cleared');
};

export const debugAuthState = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('=== AUTH DEBUG ===');
  console.log('localStorage auth_token:', localStorage.getItem('auth_token'));
  console.log('localStorage refresh_token:', localStorage.getItem('refresh_token'));
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('==================');
}; 