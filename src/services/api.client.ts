/**
 * API Client - Test Portal Mobile
 * 
 * Axios-based HTTP client with interceptors for:
 * - Automatic auth token injection
 * - Token refresh on 401 errors
 * - Request/Response logging
 * - Error handling
 */

import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from '../config/api.config';
import { tokenManager } from '../utils/tokenManager';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and log requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // CRITICAL: Always fetch the most recent token from secure storage
    const token = await tokenManager.getAuthToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API request (in development)
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        token: token ? `${token.substring(0, 20)}...` : 'none',
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and log responses
apiClient.interceptors.response.use(
  (response) => {
    // Log API response (in development)
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();

        if (refreshToken) {
          // Try to refresh token
          console.log('🔄 401 detected - Attempting to refresh token...');
          const response = await axios.post<{
            accessToken: string;
            refreshToken?: string;
          }>(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          // CRITICAL: Immediately store the new tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          await tokenManager.setAuthToken(accessToken);
          console.log('✅ New access token stored and will be used for retry');

          // If API returns a new refresh token (token rotation), store it
          if (newRefreshToken) {
            await tokenManager.setRefreshToken(newRefreshToken);
            console.log('✅ New refresh token stored (token rotation)');
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          console.log('🔄 Retrying original request with new token...');
          return apiClient(originalRequest);
        } else {
          console.warn('⚠️ No refresh token available, cannot refresh');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed in interceptor:', refreshError);
        // Refresh failed, clear tokens (app should redirect to login)
        await tokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (__DEV__) {
      console.error('❌ API Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Helper function to handle API errors
 * Extracts user-friendly error messages from API responses
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: { message: string } }>;

    if (axiosError.response) {
      return axiosError.response.data?.error?.message || 'An error occurred';
    } else if (axiosError.request) {
      return 'No response from server. Please check your connection.';
    }
  }

  return 'An unexpected error occurred';
};

/**
 * Type-safe API methods for common operations
 */
export const api = {
  get: <T>(url: string, config?: object) => 
    apiClient.get<T>(url, config).then(res => res.data),
  
  post: <T>(url: string, data?: object, config?: object) => 
    apiClient.post<T>(url, data, config).then(res => res.data),
  
  put: <T>(url: string, data?: object, config?: object) => 
    apiClient.put<T>(url, data, config).then(res => res.data),
  
  patch: <T>(url: string, data?: object, config?: object) => 
    apiClient.patch<T>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: object) => 
    apiClient.delete<T>(url, config).then(res => res.data),
};
