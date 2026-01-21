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
  // Get result by resultId - returns TestResult for compatibility with mock
  getResult: async (resultId: string): Promise<TestResult> => {
    const response = await api.get<TestResult>(
      `/results/${resultId}`
    );
    return response;
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
