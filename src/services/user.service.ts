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
    const response = await api.get<UserProfileResponse>('/users/profile');
    
    if (__DEV__) {
      console.log('✅ User profile fetched from /users/profile');
    }
    
    const data = response.data;
    
    // Map API response to User type
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      profilePicture: data.profilePicture,
      dateOfBirth: data.dateOfBirth,
      examTargets: data.examTargets as any,
      targetYear: data.targetYear,
      stats: data.stats,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
    
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
  }
};

export default userService;
