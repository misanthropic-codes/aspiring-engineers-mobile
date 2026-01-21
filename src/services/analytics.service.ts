/**
 * Analytics Service - Test Portal Mobile
 * 
 * Manages analytics-related API calls.
 */

import { UserAnalytics } from '../types';
import { api } from './api.client';

export const analyticsService = {
  // Get comprehensive user analytics
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get<UserAnalytics>('/analytics/user');
    return response;
  },
};

export default analyticsService;

