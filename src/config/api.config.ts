/**
 * API Configuration
 *
 * Centralizes the API base URL configuration for the mobile application.
 * Uses EXPO_PUBLIC_ prefix for environment variables in Expo.
 */

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    '⚠️ EXPO_PUBLIC_API_URL is not set. Please configure it in your .env file.'
  );
}

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || '',
  TIMEOUT: 30000,
} as const;

export default API_CONFIG;
