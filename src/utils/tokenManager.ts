/**
 * Secure Token Manager
 * 
 * Stores authentication tokens securely using expo-secure-store.
 * This provides encrypted storage for sensitive data on iOS (Keychain)
 * and Android (KeyStore).
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const tokenManager = {
  /**
   * Get the current authentication token
   */
  getAuthToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Set the authentication token
   */
  setAuthToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.AUTH_TOKEN, token);
      console.log('🔐 Auth token stored securely');
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  /**
   * Get the current refresh token
   */
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Set the refresh token
   */
  setRefreshToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, token);
      console.log('🔐 Refresh token stored securely');
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  /**
   * Clear all tokens (used on logout)
   */
  clearTokens: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      console.log('🔓 All tokens cleared from secure storage');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  /**
   * Check if user has valid tokens
   */
  hasTokens: async (): Promise<boolean> => {
    try {
      const authToken = await tokenManager.getAuthToken();
      const refreshToken = await tokenManager.getRefreshToken();
      return authToken !== null && refreshToken !== null;
    } catch (error) {
      console.error('Error checking tokens:', error);
      return false;
    }
  },
};

export default tokenManager;
