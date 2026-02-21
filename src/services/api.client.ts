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

// --- Refresh token queue to handle concurrent 401s ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

async function forceLogout() {
  await tokenManager.clearTokens();
  // App's auth state listener will detect missing tokens and redirect to login
}

// Response interceptor - handle 401 with single-attempt refresh + queue
apiClient.interceptors.response.use(
  (response) => {
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

    // Only handle 401 and only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();

        if (!refreshToken) {
          console.warn('⚠️ No refresh token available, forcing logout');
          processQueue(new Error('No refresh token'), null);
          await forceLogout();
          return Promise.reject(error);
        }

        console.log('🔄 401 detected — refreshing token...');
        const response = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        await tokenManager.setAuthToken(accessToken);
        if (newRefreshToken) {
          await tokenManager.setRefreshToken(newRefreshToken);
        }
        console.log('✅ Token refreshed successfully');

        // Process queued requests with new token
        processQueue(null, accessToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        await forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
