/**
 * Test Service - Test Portal Mobile
 * 
 * Manages test-related API calls.
 * Matches test-portal-client/src/services/tests.service.ts
 */

import {
  MyTestsResponse,
  Test,
  TestFilters,
} from '../types';
import { api } from './api.client';

// =====================================================
// Types matching test-portal-client exactly
// =====================================================

// Question data from API
export interface QuestionData {
  id?: string;
  questionId?: string;
  questionNumber: number;
  questionText: string;
  type?: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'NUMERICAL' | 'INTEGER';
  questionType?: 'single-correct' | 'multiple-correct' | 'numerical' | 'integer';
  images?: string[];
  options?: string[];
  questionImage?: string;
  questionImageUrl?: string;
  marks: number;
  negativeMarks: number;
  savedAnswer: string | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
  timeSpent?: number;
  language?: string;
}

// Section with questions
export interface SectionData {
  sectionId: string;
  name: string;
  subject: string;
  questions: QuestionData[];
}

// Start test response - matches API exactly
export interface StartTestResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testId: string;
    isResumed: boolean;
    test: {
      title: string;
      category: string;
      type: string;
      duration: number;
      totalMarks: number;
      marksPerQuestion: number;
      negativeMarking: number;
      instructions: string[];
    };
    timing: {
      startTime: string;
      endTime: string;
      remainingTime: number;
    };
    sections: SectionData[];
    statistics: {
      totalQuestions: number;
      answeredCount: number;
      markedForReviewCount: number;
      notAnswered: number;
    };
  };
}

// Submit test response
export interface SubmitTestResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    submittedAt: string;
    resultId: string;
  };
}

// Submit answer item for save/submit
export interface SubmitAnswerItem {
  questionId: string;
  sectionId?: string;
  answer: {
    selectedOptions?: string[];
    numericalAnswer?: number;
  };
  timeSpent: number;
}

// Test details response
export interface TestDetailsResponse {
  success: boolean;
  message: string;
  data: Test & {
    userAttempts?: Array<{
      attemptId: string;
      score: number;
      percentage: number;
      rank?: number;
      attemptedAt: string;
    }>;
  };
}

// =====================================================
// Test Service - All API methods
// =====================================================

export const testService = {
  /**
   * Get all public tests with filters
   * GET /tests
   */
  getAllTests: async (filters?: TestFilters): Promise<{ tests: Test[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.examType) params.append('examType', filters.examType);
    if (filters?.testType) params.append('testType', filters.testType);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);

    const queryString = params.toString();
    const url = queryString ? `/tests?${queryString}` : '/tests';
    const response = await api.get<{ tests: Test[]; pagination: any }>(url);
    return response;
  },

  /**
   * Get single test details
   * GET /tests/:testId
   */
  getTestById: async (testId: string): Promise<TestDetailsResponse> => {
    const response = await api.get<TestDetailsResponse>(`/tests/${testId}`);
    return response;
  },

  /**
   * Get user's assigned/purchased tests
   * GET /tests/my-tests
   */
  getMyTests: async (): Promise<MyTestsResponse> => {
    const response = await api.get<MyTestsResponse>('/tests/my-tests');
    return response;
  },

  /**
   * Start a test attempt
   * POST /tests/:testId/start
   * Returns full test data including sections with questions
   */
  startTest: async (testId: string): Promise<StartTestResponse> => {
    const response = await api.post<StartTestResponse>(`/tests/${testId}/start`);
    return response;
  },

  /**
   * Save progress (auto-save)
   * POST /attempts/:attemptId/progress
   */
  saveProgress: async (
    attemptId: string,
    answers: SubmitAnswerItem[]
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/attempts/${attemptId}/progress`,
      { answers }
    );
    return response;
  },

  /**
   * Submit test with all answers
   * POST /attempts/:attemptId/submit
   */
  submitTest: async (
    attemptId: string,
    payload?: { answers: SubmitAnswerItem[] }
  ): Promise<SubmitTestResponse> => {
    const response = await api.post<SubmitTestResponse>(
      `/attempts/${attemptId}/submit`,
      payload || {}
    );
    return response;
  },

  /**
   * Get questions for an attempt
   * GET /attempts/:attemptId/questions
   */
  getTestQuestions: async (attemptId: string, sectionId?: string): Promise<{
    success: boolean;
    data: {
      sections: SectionData[];
      statistics: {
        totalQuestions: number;
        answeredQuestions: number;
        markedForReview: number;
        notAnswered: number;
      };
    };
  }> => {
    const url = sectionId
      ? `/attempts/${attemptId}/questions?sectionId=${sectionId}`
      : `/attempts/${attemptId}/questions`;
    const response = await api.get(url);
    return response as any;
  },

  /**
   * Resume an in-progress attempt
   * GET /attempts/:attemptId/resume
   */
  resumeAttempt: async (attemptId: string): Promise<StartTestResponse> => {
    const response = await api.get<StartTestResponse>(`/attempts/${attemptId}/resume`);
    return response;
  },
};

export default testService;
