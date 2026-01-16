/**
 * Analytics Service - Test Portal Mobile
 * 
 * Manages analytics-related API calls.
 */

import { TestResult, UserAnalytics } from '../types';
import { api } from './api.client';

export const analyticsService = {
  // Get comprehensive user analytics
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get<UserAnalytics>('/analytics/user');
    return response;
  },
};

export const resultsService = {
  // Get specific test result
  getResult: async (attemptId: string): Promise<TestResult> => {
    const response = await api.get<TestResult>(`/results/${attemptId}`);
    return response;
  },
};

export default {
  analytics: analyticsService,
  results: resultsService,
};
