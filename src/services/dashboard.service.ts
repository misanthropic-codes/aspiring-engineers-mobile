/**
 * Dashboard Service - Test Portal Mobile
 * 
 * Manages dashboard-related API calls.
 */

import { DashboardStats } from '../types';
import { api } from './api.client';

export const dashboardService = {
  // Get user dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response;
  },
};

export default dashboardService;
