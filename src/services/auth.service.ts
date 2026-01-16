/**
 * Authentication Service - Test Portal Mobile
 * 
 * Handles all authentication-related API calls including:
 * - User registration
 * - User login
 * - Token refresh
 * - Profile management
 */

import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { tokenManager } from '../utils/tokenManager';
import apiClient, { handleApiError } from './api.client';

// ============================================
// API Response Types
// ============================================

interface ApiRegisterResponse {
  success: boolean;
  data: {
    email: string;
    name: string;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
  name: string;
}

interface ApiLoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      examTargets: string[];
      targetYear: number;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

// ============================================
// Auth Service
// ============================================

export const authService = {
  /**
   * Register a new user account
   * POST /auth/register
   * Note: After registration, user needs to verify email before they can log in.
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<ApiRegisterResponse>(
        '/auth/register',
        data
      );

      console.log('✅ Registration successful:', response.data.message);

      return {
        success: response.data.success,
        message: response.data.message,
        email: response.data.data.email,
        name: response.data.data.name,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiLoginResponse>(
        '/auth/login',
        credentials
      );

      console.log('✅ Login successful:', response.data.message);

      const apiToken = response.data.data.token;

      if (!apiToken) {
        console.error('⚠️ No token in API response:', response.data);
        throw new Error('No authentication token received from server');
      }

      // Map the API response to the AuthResponse format
      const authResponse: AuthResponse = {
        user: {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          dateOfBirth: '', // Not provided by login API
          examTargets: response.data.data.user.examTargets as any,
          targetYear: response.data.data.user.targetYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: apiToken,
        refreshToken: response.data.data.refreshToken,
      };

      console.log(
        '🔐 Mapped auth response with token:',
        apiToken ? 'present' : 'MISSING'
      );
      return authResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user profile
   * GET /auth/profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{
        _id: string;
        identifier: string;
        roles: string[];
      }>('/auth/profile');

      // Get full user data from storage if available
      const savedUser = await storage.get<User>(STORAGE_KEYS.USER);

      // Merge API data with saved user data
      const user: User = {
        ...savedUser,
        id: response.data._id,
        email: response.data.identifier,
        name: savedUser?.name || '',
        phone: savedUser?.phone || '',
        dateOfBirth: savedUser?.dateOfBirth || '',
        examTargets: savedUser?.examTargets || [],
        targetYear: savedUser?.targetYear || new Date().getFullYear(),
        createdAt: savedUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Profile fetched successfully');
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> => {
    try {
      console.log('🔄 Calling token refresh API...');

      const response = await apiClient.post<{
        accessToken: string;
        refreshToken?: string;
      }>('/auth/refresh', {
        refreshToken,
      });

      console.log('✅ Token refresh API successful');

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store the new access token
      await tokenManager.setAuthToken(accessToken);
      console.log('🔐 New access token stored');

      // If API returns a new refresh token (token rotation), store it
      if (newRefreshToken) {
        await tokenManager.setRefreshToken(newRefreshToken);
        console.log('🔐 New refresh token stored (token rotation)');
      }

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/auth/logout', {});
      console.log('✅ Logout successful:', response.data.message);
    } catch (error) {
      // Ignore logout errors, still clear local storage
      console.error(
        '⚠️ Logout API error (will still clear local storage):',
        error
      );
    }
  },

  /**
   * Update user profile
   * PATCH /auth/profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch<{ success: boolean; user: User }>(
        '/auth/profile',
        data
      );
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Verify OTP for email verification
   * POST /auth/verify-otp
   */
  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          user: User;
          token: string;
          refreshToken: string;
        };
        message: string;
      }>('/auth/verify-otp', { email, otp });

      console.log('✅ OTP verification successful');

      return {
        user: response.data.data.user,
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Resend OTP for email verification
   * POST /auth/resend-otp
   */
  resendOtp: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/auth/resend-otp', { email });

      console.log('✅ OTP resent successfully');
      return { message: response.data.message };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default authService;
