/**
 * Results Service - Test Portal Mobile
 * 
 * Handles result-related API calls.
 * Ported from test-portal-client/src/services/results.service.ts
 */

import { 
  AnswerKeySection, 
  AnswerKeyQuestion, 
  AnswerKeyOption, 
  TestResult,
  SectionResult,
  SubjectResult
} from '../types';
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
    testId: string;
    testTitle: string;
    userId: string;
    score: number;
    totalMarks: number;
    percentage: number;
    rank: number;
    totalAttempts: number;
    percentile: number;
    timeTaken: number;
    submittedAt: string;
    sectionWise: {
      sectionName: string;
      score: number;
      totalMarks: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unattempted: number;
    }[];
    subjectWise: {
      subject: string;
      score: number;
      totalMarks: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unattempted: number;
      timeTaken: number;
      accuracy: number;
    }[];
    difficultyWise: {
      easy: { correct: number; incorrect: number; unattempted: number };
      medium: { correct: number; incorrect: number; unattempted: number };
      hard: { correct: number; incorrect: number; unattempted: number };
    };
    speedAccuracy: {
      speed: string | number;
      accuracy: string | number;
    };
    comparison: {
      averageScore: string | number;
      topperScore: number;
      yourScore: number;
    };
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



export interface AnswerKeyResponse {
  success: boolean;
  data: {
    attemptId: string;
    testTitle: string;
    sections: AnswerKeySection[];
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
      const response = await api.get<AttemptResultResponse>(`/attempts/${id}/result`);
      const raw = response.data;
      
      if (!raw) throw new Error('Result data missing');

      // Map API structure to UI structure
      // Note: The new API is already flat, so we mostly just pass it through or fix types
      const mappedResult: TestResult = {
        attemptId: raw.attemptId || id,
        testId: raw.testId || '',
        testTitle: raw.testTitle || 'Test Result',
        userId: raw.userId || '',
        score: raw.score ?? 0,
        totalMarks: raw.totalMarks ?? 0,
        percentage: raw.percentage ?? 0,
        rank: raw.rank ?? 0,
        totalAttempts: raw.totalAttempts ?? 0,
        percentile: raw.percentile ?? 0,
        timeTaken: raw.timeTaken ?? 0,
        submittedAt: raw.submittedAt || '',
        sectionWise: (raw.sectionWise || []).map((s: any) => ({
          sectionId: s.sectionId || s.sectionName || '',
          sectionName: s.sectionName || 'Section',
          subject: s.subject || '',
          score: s.score ?? 0,
          totalMarks: s.totalMarks ?? 0,
          accuracy: s.accuracy ?? 0,
          correctAnswers: s.correctAnswers ?? 0,
          incorrectAnswers: s.incorrectAnswers ?? 0,
          unattempted: s.unattempted ?? 0,
        })),
        subjectWise: (raw.subjectWise || []).map((s: any) => ({
          subject: s.subject || '',
          score: s.score ?? 0,
          totalMarks: s.totalMarks ?? 0,
          accuracy: s.accuracy ?? 0,
          correctAnswers: s.correctAnswers ?? 0,
          incorrectAnswers: s.incorrectAnswers ?? 0,
          unattempted: s.unattempted ?? 0,
          timeTaken: s.timeTaken ?? 0,
        })),
        difficultyWise: raw.difficultyWise || {
          easy: { correct: 0, incorrect: 0, unattempted: 0 },
          medium: { correct: 0, incorrect: 0, unattempted: 0 },
          hard: { correct: 0, incorrect: 0, unattempted: 0 },
        },
        speedAccuracy: {
          speed: raw.speedAccuracy?.speed || 0,
          accuracy: raw.speedAccuracy?.accuracy || 0,
        },
        comparison: {
          averageScore: raw.comparison?.averageScore || 0,
          topperScore: raw.comparison?.topperScore || 0,
          yourScore: raw.score ?? 0,
        }
      };

      return mappedResult;
    } catch (error) {
      console.error('❌ Error in getResult:', error);
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
