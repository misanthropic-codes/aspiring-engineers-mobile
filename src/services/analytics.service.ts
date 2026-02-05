/**
 * Analytics Service - Test Portal Mobile
 * 
 * Manages analytics-related API calls.
 */

import { UserAnalytics } from '../types';
import { api } from './api.client';

interface AnalyticsApiResponse {
  success: boolean;
  data: UserAnalytics;
}

export const analyticsService = {
  // Get comprehensive user analytics
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get<AnalyticsApiResponse>('/users/analytics');
    return response.data;
  },
};

export default analyticsService;
