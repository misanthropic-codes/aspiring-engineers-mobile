/**
 * Mock API Service - Test Portal Mobile
 * 
 * Simulates API responses using mock data for testing all app features.
 * Toggle USE_MOCK in config to switch between mock and real API.
 */

import {
    AttemptSection,
    AuthResponse,
    DashboardStats,
    LoginCredentials,
    MyTestsResponse,
    RegisterData,
    Test,
    TestAttempt,
    TestFilters,
    TestResult,
    User,
    UserAnalytics,
} from '../types';
import {
    mockAnalytics,
    mockDashboardStats,
    mockMyTests,
    mockTestResult,
    mockTests,
    mockUsers,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// Mock Auth Service
// ============================================

export const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(1000);

    // Check credentials (for demo, accept test@test.com / Password123)
    if (credentials.email === 'test@test.com' && credentials.password === 'Password123') {
      const user = mockUsers[1];
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      };
    }

    // Accept any valid email with correct format for demo
    const user = { ...mockUsers[0], email: credentials.email };
    return {
      user,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
  },

  register: async (data: RegisterData): Promise<{ success: boolean; message: string; email: string; name: string }> => {
    await delay(1000);

    return {
      success: true,
      message: 'Registration successful! Please check your email for OTP.',
      email: data.email,
      name: data.name,
    };
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    await delay(800);

    // Accept any 6-digit OTP for demo
    if (otp.length !== 6) {
      throw new Error('Invalid OTP format');
    }

    return {
      user: { ...mockUsers[0], email },
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
  },

  resendOtp: async (email: string): Promise<{ message: string }> => {
    await delay(500);
    return { message: 'OTP sent successfully to ' + email };
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    await delay(800);
    return { message: 'Password reset link sent to ' + email };
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    await delay(800);
    return { message: 'Password reset successfully' };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    return mockUsers[0];
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    await delay(300);
    return {
      accessToken: 'mock_jwt_token_refreshed_' + Date.now(),
      refreshToken: 'mock_refresh_token_refreshed_' + Date.now(),
    };
  },

  logout: async (): Promise<void> => {
    await delay(300);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await delay(500);
    return { ...mockUsers[0], ...data };
  },
};

// ============================================
// Mock Test Service
// ============================================

export const mockTestService = {
  getAllTests: async (filters?: TestFilters): Promise<{ tests: Test[]; pagination: any }> => {
    await delay(500);

    let filteredTests = [...mockTests];

    if (filters?.examType) {
      filteredTests = filteredTests.filter((t) => t.examType === filters.examType);
    }
    if (filters?.testType) {
      filteredTests = filteredTests.filter((t) => t.testType === filters.testType);
    }
    if (filters?.difficulty) {
      filteredTests = filteredTests.filter((t) => t.difficulty === filters.difficulty);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredTests = filteredTests.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    return {
      tests: filteredTests,
      pagination: {
        currentPage: filters?.page || 1,
        totalPages: 1,
        totalItems: filteredTests.length,
        hasMore: false,
      },
    };
  },

  getTestById: async (testId: string): Promise<Test> => {
    await delay(400);
    const test = mockTests.find((t) => t.id === testId);
    if (!test) throw new Error('Test not found');
    return test;
  },

  getMyTests: async (): Promise<MyTestsResponse> => {
    await delay(500);

    const stats = {
      totalTests: mockMyTests.length,
      assignedTests: mockMyTests.filter((t) => t.source === 'assigned').length,
      purchasedTests: mockMyTests.filter((t) => t.source === 'purchased').length,
      attemptedTests: mockMyTests.filter((t) => t.hasAttempted).length,
      completedTests: mockMyTests.filter((t) => t.progress === 'completed').length,
      notStarted: mockMyTests.filter((t) => t.progress === 'not-started').length,
      overallAverage: 59.09,
      totalAttempts: 1,
    };

    // Group by category
    const categories: Record<string, typeof mockMyTests> = {};
    mockMyTests.forEach((test) => {
      if (!categories[test.category]) {
        categories[test.category] = [];
      }
      categories[test.category].push(test);
    });

    const categoryList = Object.entries(categories).map(([category, tests]) => ({
      category,
      totalTests: tests.length,
      attemptedTests: tests.filter((t) => t.hasAttempted).length,
      completedTests: tests.filter((t) => t.progress === 'completed').length,
      averagePercentage: tests.reduce((acc, t) => acc + (t.lastPercentage || 0), 0) / tests.length,
      tests,
    }));

    return {
      success: true,
      stats,
      categories: categoryList,
      accessibleTestIds: mockMyTests.map((t) => t.testId),
    };
  },

  startTest: async (testId: string): Promise<TestAttempt> => {
    await delay(800);

    const test = mockTests.find((t) => t.id === testId);
    if (!test) throw new Error('Test not found');

    const sections: AttemptSection[] = test.sections.map((section, index) => {
      const questions = [];
      for (let i = 0; i < Math.min(section.questionCount, 5); i++) {
        const questionNum = index * 5 + i + 1;
        if (i < 3) {
          questions.push({
            id: `q${questionNum}`,
            questionNumber: questionNum,
            type: 'MCQ_SINGLE' as any,
            questionText: `Sample question ${questionNum} for ${section.name}`,
            options: [
              { id: 'opt1', text: 'Option A' },
              { id: 'opt2', text: 'Option B' },
              { id: 'opt3', text: 'Option C' },
              { id: 'opt4', text: 'Option D' },
            ],
            marks: 4,
            negativeMarks: -1,
            isAnswered: false,
            isMarkedForReview: false,
            language: 'ENGLISH' as const,
          });
        } else {
          questions.push({
            id: `q${questionNum}`,
            questionNumber: questionNum,
            type: 'NUMERICAL' as any,
            questionText: `Numerical question ${questionNum} for ${section.name}`,
            marks: 4,
            negativeMarks: 0,
            isAnswered: false,
            isMarkedForReview: false,
            language: 'ENGLISH' as const,
          });
        }
      }

      return {
        sectionId: section.id,
        name: section.name,
        duration: section.duration,
        questions,
      };
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.duration * 60 * 1000);

    return {
      attemptId: 'attempt_' + Date.now(),
      testId: test.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: test.duration,
      sections,
      canResume: true,
      status: 'IN_PROGRESS' as any,
    };
  },

  submitTest: async (attemptId: string): Promise<{ resultId: string }> => {
    await delay(1000);
    return { resultId: 'result_' + attemptId };
  },
};

// ============================================
// Mock Dashboard Service
// ============================================

export const mockDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(500);
    return mockDashboardStats;
  },
};

// ============================================
// Mock Analytics Service
// ============================================

export const mockAnalyticsService = {
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    await delay(500);
    return mockAnalytics;
  },
};

// ============================================
// Mock Results Service
// ============================================

export const mockResultsService = {
  getResult: async (attemptId: string): Promise<TestResult> => {
    await delay(500);
    return { ...mockTestResult, attemptId };
  },
};

export default {
  auth: mockAuthService,
  tests: mockTestService,
  dashboard: mockDashboardService,
  analytics: mockAnalyticsService,
  results: mockResultsService,
};
