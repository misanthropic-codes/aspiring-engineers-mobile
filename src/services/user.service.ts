/**
 * User Service - Test Portal Mobile
 * 
 * Handles detailed user profile and statistics.
 * Matches test-portal-client/src/services/user.service.ts
 */

import { User } from '../types';
import { api } from './api.client';

interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
    dateOfBirth: string;
    examTargets: string[];
    targetYear: number;
    stats: {
      testsAttempted: number;
      averageScore: number;
      bestRank: number;
      totalStudyHours: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export const userService = {
  /**
   * Get current user's detailed profile with statistics
   * GET /users/profile
   */
  getUserProfile: async (): Promise<User> => {
    // Note: 'api.get' returns 'response.data' directly
    const response = await api.get<any>('/users/profile');
    
    if (__DEV__) {
      console.log('👤 /users/profile full response:', JSON.stringify(response, null, 2));
    }
    
    // Some APIs wrap in 'data', some don't
    const data = response.data || response;
    
    // Map API response to User type with robust stats handling
    const user: User = {
      id: data.id || data._id || '',
      name: data.name || '',
      email: data.email || data.identifier || '',
      phone: data.phone || '',
      profilePicture: data.profilePicture,
      dateOfBirth: data.dateOfBirth || '',
      examTargets: data.examTargets as any || [],
      targetYear: data.targetYear || 0,
      stats: {
        testsAttempted: data.stats?.testsAttempted ?? 0,
        averageScore: data.stats?.averageScore ?? 0,
        bestRank: data.stats?.bestRank ?? 0,
        totalStudyHours: data.stats?.totalStudyHours ?? 0,
      },
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };
    
    if (__DEV__) {
      console.log('✅ User profile mapped stats:', user.stats);
    }
    
    return user;
  },

  /**
   * Update current user's profile information
   * PUT /users/profile
   */
  updateUserProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<{
      success: boolean;
      data: { user: UserProfileResponse['data'] };
      message: string;
    }>('/users/profile', {
      name: data.name,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      examTargets: data.examTargets,
      targetYear: data.targetYear,
      profilePicture: data.profilePicture,
    });
    
    const userData = response.data.user;
    
    // Map API response to User type
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      profilePicture: userData.profilePicture,
      dateOfBirth: userData.dateOfBirth,
      examTargets: userData.examTargets as any,
      targetYear: userData.targetYear,
      stats: userData.stats,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
    
    return user;
  },

  /**
   * Change user password
   * POST /users/change-password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<any>('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};

export default userService;
