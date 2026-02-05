/**
 * Counselling Service - Aspiring Engineers Mobile
 * 
 * API service for all counselling-related operations.
 * Ported from test-portal-client counselling.service.ts
 */

import {
    BookSessionPayload,
    CounsellingEnrollment,
    CounsellingSession,
    Counsellor,
    GetSessionsParams,
    ReviewPayload,
} from '../types/counselling';
import apiClient, { handleApiError } from './api.client';

const counsellingService = {
  /**
   * Get current user's counselling enrollments
   * GET /counselling/enrollments/my
   */
  getMyEnrollments: async (): Promise<CounsellingEnrollment[]> => {
    try {
      console.log('🚀 [counsellingService] GET /counselling/enrollments/my');
      const response = await apiClient.get<
        | { success: boolean; data: CounsellingEnrollment[] }
        | CounsellingEnrollment[]
      >('/counselling/enrollments/my');

      console.log('✅ [counsellingService] Enrollments response received');

      // Handle both wrapped and direct array responses
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error('❌ [counsellingService] Failed to fetch enrollments:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Book a counselling session
   * POST /counselling/sessions
   */
  bookSession: async (payload: BookSessionPayload): Promise<CounsellingSession> => {
    try {
      console.log('🚀 [counsellingService] POST /counselling/sessions', payload);
      const response = await apiClient.post<{
        success: boolean;
        data: CounsellingSession;
      }>('/counselling/sessions', payload);

      console.log('✅ [counsellingService] Session booked successfully');
      return response.data.data;
    } catch (error) {
      console.error('❌ [counsellingService] Failed to book session:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user's counselling sessions
   * GET /counselling/sessions/my
   */
  getMySessions: async (params?: GetSessionsParams): Promise<CounsellingSession[]> => {
    try {
      console.log('🚀 [counsellingService] GET /counselling/sessions/my', params);
      const response = await apiClient.get<
        | { success: boolean; data: CounsellingSession[] }
        | CounsellingSession[]
      >('/counselling/sessions/my', { params });

      console.log('✅ [counsellingService] Sessions response received');

      // Handle both wrapped and direct array responses
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error('❌ [counsellingService] Failed to fetch sessions:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Cancel a counselling session
   * PATCH /counselling/sessions/:id/cancel
   */
  cancelSession: async (
    sessionId: string,
    reason: string
  ): Promise<CounsellingSession> => {
    try {
      console.log(
        `🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/cancel`,
        { reason }
      );
      const response = await apiClient.patch<{
        success: boolean;
        data: CounsellingSession;
      }>(`/counselling/sessions/${sessionId}/cancel`, { reason });

      console.log('✅ [counsellingService] Session cancelled successfully');
      return response.data.data;
    } catch (error) {
      console.error('❌ [counsellingService] Failed to cancel session:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Submit a review for a completed session
   * POST /counselling/reviews
   */
  submitReview: async (payload: ReviewPayload): Promise<any> => {
    try {
      console.log('🚀 [counsellingService] POST /counselling/reviews', payload);
      const response = await apiClient.post<{
        success: boolean;
        data: any;
      }>('/counselling/reviews', payload);

      console.log('✅ [counsellingService] Review submitted successfully');
      return response.data.data;
    } catch (error) {
      console.error('❌ [counsellingService] Failed to submit review:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get list of available counsellors
   * GET /counselling/counsellors
   */
  getAvailableCounsellors: async (): Promise<Counsellor[]> => {
    try {
      console.log('🚀 [counsellingService] GET /counselling/counsellors');
      const response = await apiClient.get<{
        success: boolean;
        data: Counsellor[];
      }>('/counselling/counsellors');

      console.log('✅ [counsellingService] Counsellors response received');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ [counsellingService] Failed to fetch counsellors:', error);
      throw new Error(handleApiError(error));
    }
  },
};

export default counsellingService;
