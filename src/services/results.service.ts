/**
 * Results Service - Test Portal Mobile
 * 
 * Handles result-related API calls.
 * Ported from test-portal-client/src/services/results.service.ts
 */

import { TestResult } from '../types';
import { api } from './api.client';

// Attempt result answer
export interface AttemptResultAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string | null;
  isCorrect: boolean;
  marksObtained: number;
  timeSpent: number;
  explanation: string;
  solutionImageUrl?: string;
}

// Attempt result response
export interface AttemptResultResponse {
  success: boolean;
  data: {
    attemptId: string;
    test: {
      testId: string;
      title: string;
      category: string;
      type: string;
    };
    score: number;
    totalMarks: number;
    percentage: number;
    timeTaken: number;
    startTime: string;
    submittedAt: string;
    statistics: {
      totalQuestions: number;
      attempted: number;
      correct: number;
      incorrect: number;
      unattempted: number;
    };
    answers: AttemptResultAnswer[];
  };
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
}

// Leaderboard response
export interface LeaderboardResponse {
  success: boolean;
  data: {
    testId: string;
    testTitle: string;
    leaderboard: LeaderboardEntry[];
    yourRank?: {
      rank: number;
      score: number;
      percentage: number;
      percentile: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Answer key
export interface AnswerKeyQuestion {
  questionNumber: number;
  questionId: string;
  questionText: string;
  questionType: string;
  options?: string[];
  questionImage?: string;
  correctAnswer: string;
  yourAnswer: string;
  isCorrect: boolean;
  marks: number;
  marksObtained: number;
  solutionText?: string;
  solutionImage?: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  timeSpent: number;
}

export interface AnswerKeyResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testTitle: string;
    questions: AnswerKeyQuestion[];
    summary: {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unanswered: number;
      marksObtained: number;
      totalMarks: number;
    };
  };
}

export const resultsService = {
  // Get result by attemptId - maps AttemptResultResponse to flat TestResult type
  getResult: async (id: string): Promise<TestResult> => {
    try {
      // Use /attempts/:id/result (matches web client result page data)
      const response = await api.get<any>(`/attempts/${id}/result`);
      const payload = response; // api.get returns response.data

      if (__DEV__) {
        console.log('🏁 getResult payload:', {
          success: payload?.success,
          hasData: !!payload?.data,
          keys: payload?.data ? Object.keys(payload.data) : []
        });
      }

      const raw = payload?.data || payload;
      if (!raw) throw new Error('Result data missing');

      // Map nested API structure (AttemptResultResponse) to flat UI structure (TestResult)
      const mappedResult: TestResult = {
        attemptId: raw.attemptId || id,
        testId: raw.test?.testId || raw.testId || '',
        testTitle: raw.test?.title || raw.testTitle || 'Test Result',
        userId: raw.userId || '',
        score: raw.score ?? 0,
        totalMarks: raw.totalMarks ?? 0,
        percentage: (raw.percentage ?? ((raw.score / raw.totalMarks) * 100)) || 0,
        rank: raw.rank?.rank ?? raw.rank ?? 0,
        totalAttempts: raw.rank?.totalParticipants ?? raw.statistics?.totalParticipants ?? 0,
        percentile: raw.rank?.percentile ?? 0,
        timeTaken: Math.floor((raw.timeTaken || 0) / 60) || 1, // raw is often in seconds
        submittedAt: raw.submittedAt || raw.endTime || '',
        sectionWise: (raw.sectionWiseScore || raw.sectionWise || raw.statistics?.sections || []).map((s: any) => ({
          sectionId: s.sectionId || s.sectionName || '',
          sectionName: s.sectionName || 'Section',
          subject: s.subject || '',
          score: s.marksObtained ?? s.score ?? 0,
          totalMarks: s.totalMarks ?? 0,
          accuracy: s.accuracy ?? 0,
          correctAnswers: s.correctAnswers ?? s.correct ?? 0,
          incorrectAnswers: s.incorrectAnswers ?? s.incorrect ?? 0,
          unattempted: s.unanswered ?? s.unattempted ?? 0,
        })),
        subjectWise: (raw.subjectWiseScore || raw.subjectWise || []).map((s: any) => ({
          subject: s.subject || '',
          score: s.marksObtained ?? s.score ?? 0,
          totalMarks: s.totalMarks ?? 0,
          accuracy: s.accuracy ?? 0,
          correctAnswers: s.correctAnswers ?? 0,
          incorrectAnswers: s.incorrectAnswers ?? 0,
          unattempted: s.unanswered ?? s.unattempted ?? 0,
          timeTaken: Math.floor((s.timeSpent || 0) / 60),
        })),
        difficultyWise: raw.difficultyWiseScore || {
          easy: { correct: 0, incorrect: 0, unattempted: 0 },
          medium: { correct: 0, incorrect: 0, unattempted: 0 },
          hard: { correct: 0, incorrect: 0, unattempted: 0 },
        },
        speedAccuracy: {
          speed: raw.timeAnalysis?.averageTimePerQuestion || 0,
          accuracy: raw.score?.accuracy || raw.percentage || 0,
        },
        comparison: {
          averageScore: raw.comparison?.averageScore || 0,
          topperScore: raw.comparison?.highestScore || 0,
          yourScore: raw.score ?? 0,
        }
      };

      if (__DEV__) {
        console.log('✅ Result mapped successfully:', mappedResult.testTitle);
      }

      return mappedResult;
    } catch (error) {
      console.error('❌ Error in getResult mapping:', error);
      // If /attempts/:id/result fails, try /results/:id as fallback
      if (id) {
         try {
           const fallback = await api.get<any>(`/results/${id}`);
           console.log('ℹ️ Used /results/:id fallback');
           return fallback.data || fallback;
         } catch (e) {
           console.error('❌ Fallback also failed');
         }
      }
      throw error;
    }
  },

  // Get attempt result with answers (detailed)
  getAttemptResult: async (attemptId: string): Promise<AttemptResultResponse> => {
    const response = await api.get<AttemptResultResponse>(
      `/attempts/${attemptId}/result`
    );
    return response;
  },

  // Get answer key with solutions
  getAnswerKey: async (attemptId: string, sectionId?: string): Promise<AnswerKeyResponse> => {
    const url = sectionId
      ? `/results/${attemptId}/answer-key?sectionId=${sectionId}`
      : `/results/${attemptId}/answer-key`;
    const response = await api.get<AnswerKeyResponse>(url);
    return response;
  },

  // Get leaderboard for a test
  getLeaderboard: async (
    testId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<LeaderboardResponse> => {
    const response = await api.get<LeaderboardResponse>(
      `/results/leaderboard/${testId}?page=${page}&limit=${limit}`
    );
    return response;
  },
};

export default resultsService;
