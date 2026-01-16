/**
 * Test Service - Test Portal Mobile
 * 
 * Manages test-related API calls.
 */

import {
    MyTestsResponse,
    Test,
    TestAttempt,
    TestFilters,
} from '../types';
import { api } from './api.client';

export const testService = {
  // Get all public tests with filters
  getAllTests: async (filters?: TestFilters): Promise<{ tests: Test[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.examType) params.append('examType', filters.examType);
    if (filters?.testType) params.append('testType', filters.testType);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);

    const response = await api.get<{ tests: Test[]; pagination: any }>(
      `/tests?${params.toString()}`
    );
    return response;
  },

  // Get single test details
  getTestById: async (testId: string): Promise<Test> => {
    const response = await api.get<Test>(`/tests/${testId}`);
    return response;
  },

  // Get user's assigned/purchased tests
  getMyTests: async (): Promise<MyTestsResponse> => {
    const response = await api.get<MyTestsResponse>('/tests/my-tests');
    return response;
  },

  // Start a test attempt
  startTest: async (testId: string): Promise<TestAttempt> => {
    const response = await api.post<TestAttempt>(`/tests/${testId}/start`);
    return response;
  },

  // Submit a test attempt
  submitTest: async (attemptId: string): Promise<{ resultId: string }> => {
    const response = await api.post<{ resultId: string }>(`/tests/attempts/${attemptId}/submit`);
    return response;
  },
};

export default testService;
