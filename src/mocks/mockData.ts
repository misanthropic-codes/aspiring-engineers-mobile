/**
 * Mock Data - Test Portal Mobile
 * 
 * Mock data for testing all app features without a real API.
 * Ported and adapted from test-portal-client/src/services/mock/mockData.ts
 */

import {
    DashboardStats,
    Difficulty,
    ExamType,
    MyTest,
    Question,
    QuestionType,
    Subject,
    Test,
    TestResult,
    TestStatus,
    TestType,
    User,
    UserAnalytics
} from '../types';

// ============================================
// Mock Users
// ============================================

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@test.com',
    phone: '9876543210',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    dateOfBirth: '2005-05-15',
    examTargets: [ExamType.JEE_MAIN, ExamType.JEE_ADVANCED],
    targetYear: 2025,
    stats: {
      testsAttempted: 45,
      averageScore: 245.5,
      bestRank: 123,
      totalStudyHours: 450,
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z',
  },
  {
    id: '2',
    name: 'Test User',
    email: 'test@test.com',
    phone: '9999999999',
    dateOfBirth: '2006-01-01',
    examTargets: [ExamType.NEET],
    targetYear: 2025,
    stats: {
      testsAttempted: 12,
      averageScore: 420.5,
      bestRank: 89,
      totalStudyHours: 120,
    },
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
];

// ============================================
// Question Generators
// ============================================

const generateMCQQuestion = (num: number, subject: Subject): Question => ({
  id: `q${num}`,
  questionNumber: num,
  type: QuestionType.MCQ_SINGLE,
  questionText: `A particle of mass 2kg is moving with velocity v = 3i + 4j m/s. What is the magnitude of its momentum?`,
  images: [],
  options: [
    { id: 'opt1', text: '10 kg·m/s', isCorrect: true },
    { id: 'opt2', text: '14 kg·m/s', isCorrect: false },
    { id: 'opt3', text: '6 kg·m/s', isCorrect: false },
    { id: 'opt4', text: '8 kg·m/s', isCorrect: false },
  ],
  marks: 4,
  negativeMarks: -1,
  isAnswered: false,
  isMarkedForReview: false,
  language: 'ENGLISH',
  difficulty: Difficulty.MEDIUM,
  solution: 'Momentum = mass × velocity. Magnitude = m√(vx² + vy²) = 2√(9+16) = 10 kg·m/s',
  tags: ['Mechanics', 'Momentum'],
});

const generateNumericalQuestion = (num: number, subject: Subject): Question => ({
  id: `q${num}`,
  questionNumber: num,
  type: QuestionType.NUMERICAL,
  questionText: `The value of ∫₀^(π/2) sin²(x) dx is equal to:`,
  marks: 4,
  negativeMarks: 0,
  isAnswered: false,
  isMarkedForReview: false,
  language: 'ENGLISH',
  difficulty: Difficulty.HARD,
  solution: 'Using the formula sin²(x) = (1-cos(2x))/2, the integral evaluates to π/4',
  tags: ['Calculus', 'Integration'],
});

// ============================================
// Mock Tests
// ============================================

export const mockTests: Test[] = [
  {
    id: 'test1',
    title: 'JEE Main 2025 Full Test 1',
    description: 'Complete JEE Main pattern test covering all subjects with detailed solutions.',
    examType: ExamType.JEE_MAIN,
    testType: TestType.MOCK,
    difficulty: Difficulty.MEDIUM,
    duration: 180,
    totalMarks: 300,
    totalQuestions: 75,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATHEMATICS],
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    status: TestStatus.LIVE,
    isPaid: false,
    instructions: 'Total duration: 3 hours. Each correct answer: +4 marks. Each incorrect answer: -1 mark.',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
      {
        id: 'sec3',
        name: 'Mathematics',
        subject: Subject.MATHEMATICS,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
    },
    syllabus: ['Mechanics', 'Thermodynamics', 'Organic Chemistry', 'Calculus', 'Algebra'],
    attemptCount: 1245,
    isAttempted: false,
    stats: {
      totalAttempts: 1245,
      averageScore: 185.5,
      highestScore: 295,
    },
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
  },
  {
    id: 'test2',
    title: 'NEET 2025 Mock Test - Biology Focus',
    description: 'Comprehensive NEET test with emphasis on Biology topics.',
    examType: ExamType.NEET,
    testType: TestType.MOCK,
    difficulty: Difficulty.MEDIUM,
    duration: 180,
    totalMarks: 720,
    totalQuestions: 180,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY],
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
    status: TestStatus.UPCOMING,
    scheduledAt: '2025-01-15T09:00:00Z',
    isPaid: false,
    instructions: 'Total 180 questions, 3 hours duration.',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        questionCount: 45,
        marks: 180,
        isTimed: false,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        questionCount: 45,
        marks: 180,
        isTimed: false,
      },
      {
        id: 'sec3',
        name: 'Biology',
        subject: Subject.BIOLOGY,
        questionCount: 90,
        marks: 360,
        isTimed: false,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
    },
    attemptCount: 856,
    isAttempted: false,
    stats: {
      totalAttempts: 856,
      averageScore: 450.2,
      highestScore: 700,
    },
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  },
  {
    id: 'test3',
    title: 'JEE Advanced Previous Year 2024',
    description: 'Complete JEE Advanced 2024 Paper with authentic solutions.',
    examType: ExamType.JEE_ADVANCED,
    testType: TestType.PREVIOUS_YEAR,
    difficulty: Difficulty.HARD,
    duration: 180,
    totalMarks: 264,
    totalQuestions: 54,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATHEMATICS],
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    status: TestStatus.LIVE,
    isPaid: false,
    instructions: 'JEE Advanced Pattern. Challenging questions from 2024.',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
      {
        id: 'sec3',
        name: 'Mathematics',
        subject: Subject.MATHEMATICS,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -2,
      unattemptedMarks: 0,
    },
    attemptCount: 2340,
    isAttempted: true,
    userAttempts: [
      {
        attemptId: 'attempt1',
        attemptNumber: 1,
        score: 156,
        rank: 450,
        completedAt: '2024-12-10T15:30:00Z',
      },
    ],
    stats: {
      totalAttempts: 2340,
      averageScore: 125.5,
      highestScore: 250,
    },
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
  },
  {
    id: 'test4',
    title: 'Physics Chapter Test - Mechanics',
    description: 'Focused test on Newtonian Mechanics, Work, Energy and Power.',
    examType: ExamType.JEE_MAIN,
    testType: TestType.CHAPTER_WISE,
    difficulty: Difficulty.EASY,
    duration: 45,
    totalMarks: 60,
    totalQuestions: 15,
    subjects: [Subject.PHYSICS],
    status: TestStatus.LIVE,
    isPaid: false,
    instructions: 'Chapter-wise test for quick revision.',
    sections: [
      {
        id: 'sec1',
        name: 'Mechanics',
        subject: Subject.PHYSICS,
        questionCount: 15,
        marks: 60,
        isTimed: false,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
    },
    attemptCount: 567,
    isAttempted: false,
    stats: {
      totalAttempts: 567,
      averageScore: 42.5,
      highestScore: 60,
    },
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
  },
];

// ============================================
// Mock My Tests Data
// ============================================

export const mockMyTests: MyTest[] = [
  {
    testId: 'test1',
    title: 'JEE Main 2025 Full Test 1',
    description: 'Complete JEE Main pattern test',
    category: 'JEE Main',
    type: 'MOCK',
    duration: 180,
    totalMarks: 300,
    marksPerQuestion: 4,
    negativeMarking: -1,
    isPaid: false,
    source: 'assigned',
    status: 'active',
    hasAttempted: false,
    attemptsCount: 0,
    progress: 'not-started',
  },
  {
    testId: 'test3',
    title: 'JEE Advanced Previous Year 2024',
    description: 'Complete JEE Advanced 2024 Paper',
    category: 'JEE Advanced',
    type: 'PREVIOUS_YEAR',
    duration: 180,
    totalMarks: 264,
    marksPerQuestion: 4,
    negativeMarking: -2,
    isPaid: false,
    source: 'purchased',
    status: 'active',
    hasAttempted: true,
    attemptsCount: 1,
    lastAttemptDate: '2024-12-10T15:30:00Z',
    lastScore: 156,
    lastPercentage: 59.09,
    lastRank: 450,
    bestScore: 156,
    bestPercentage: 59.09,
    bestRank: 450,
    progress: 'completed',
  },
  {
    testId: 'test4',
    title: 'Physics Chapter Test - Mechanics',
    description: 'Focused test on Mechanics',
    category: 'Chapter Tests',
    type: 'CHAPTER_WISE',
    duration: 45,
    totalMarks: 60,
    marksPerQuestion: 4,
    negativeMarking: -1,
    isPaid: false,
    source: 'assigned',
    status: 'active',
    hasAttempted: false,
    attemptsCount: 0,
    progress: 'not-started',
  },
];

// ============================================
// Mock Dashboard Stats
// ============================================

export const mockDashboardStats: DashboardStats = {
  todayStudyTime: 120,
  weekStudyTime: 650,
  testsThisWeek: 5,
  averageScoreThisWeek: 245.5,
  upcomingTests: [
    {
      testId: 'test2',
      title: 'NEET 2025 Mock Test',
      scheduledAt: '2025-01-15T09:00:00Z',
      duration: 180,
      isRegistered: true,
    },
  ],
  recentActivity: [
    {
      type: 'TEST_COMPLETED',
      testId: 'test3',
      attemptId: 'attempt1',
      testTitle: 'JEE Advanced Previous Year 2024',
      timestamp: '2024-12-10T15:30:00Z',
    },
  ],
  recommendations: [
    {
      testId: 'test1',
      title: 'JEE Main 2025 Full Test 1',
      reason: 'Based on your performance in Physics',
    },
    {
      testId: 'test4',
      title: 'Physics Chapter Test - Mechanics',
      reason: 'Improve your weak topics',
    },
  ],
};

// ============================================
// Mock Analytics
// ============================================

export const mockAnalytics: UserAnalytics = {
  totalTests: 45,
  averageScore: 65.5,
  averagePercentile: 85.2,
  bestRank: 123,
  totalStudyHours: 450,
  strengths: ['Physics - Mechanics', 'Mathematics - Calculus', 'Chemistry - Organic'],
  weaknesses: ['Physics - Optics', 'Mathematics - Probability'],
  subjectWise: [
    {
      subject: Subject.PHYSICS,
      testsAttempted: 15,
      averageScore: 68.5,
      accuracy: 72.3,
      timeSpent: 150,
    },
    {
      subject: Subject.CHEMISTRY,
      testsAttempted: 15,
      averageScore: 62.1,
      accuracy: 65.8,
      timeSpent: 140,
    },
    {
      subject: Subject.MATHEMATICS,
      testsAttempted: 15,
      averageScore: 66.2,
      accuracy: 70.1,
      timeSpent: 160,
    },
  ],
  progressChart: [
    { date: '2024-11-01', score: 58, percentile: 75 },
    { date: '2024-11-15', score: 62, percentile: 78 },
    { date: '2024-12-01', score: 65, percentile: 82 },
    { date: '2024-12-15', score: 68, percentile: 85 },
  ],
  topicWise: [
    { topic: 'Mechanics', questionsAttempted: 120, accuracy: 78.5, averageTime: 2.5, strength: 'HIGH' },
    { topic: 'Calculus', questionsAttempted: 100, accuracy: 72.0, averageTime: 3.0, strength: 'HIGH' },
    { topic: 'Organic Chemistry', questionsAttempted: 80, accuracy: 68.5, averageTime: 2.8, strength: 'MEDIUM' },
    { topic: 'Optics', questionsAttempted: 50, accuracy: 55.0, averageTime: 3.5, strength: 'LOW' },
  ],
  recentTests: [
    { testId: 'test3', testTitle: 'JEE Advanced Previous Year 2024', score: 156, rank: 450, completedAt: '2024-12-10T15:30:00Z' },
  ],
};

// ============================================
// Mock Test Result
// ============================================

export const mockTestResult: TestResult = {
  attemptId: 'attempt1',
  testId: 'test3',
  testTitle: 'JEE Advanced Previous Year 2024',
  userId: '1',
  score: 156,
  totalMarks: 264,
  percentage: 59.09,
  rank: 450,
  totalAttempts: 2340,
  percentile: 80.77,
  timeTaken: 165,
  submittedAt: '2024-12-10T15:30:00Z',
  sectionWise: [
    {
      sectionId: 'sec1',
      sectionName: 'Physics',
      subject: Subject.PHYSICS,
      score: 52,
      totalMarks: 88,
      accuracy: 65.0,
      correctAnswers: 14,
      incorrectAnswers: 3,
      unattempted: 1,
    },
    {
      sectionId: 'sec2',
      sectionName: 'Chemistry',
      subject: Subject.CHEMISTRY,
      score: 48,
      totalMarks: 88,
      accuracy: 61.11,
      correctAnswers: 13,
      incorrectAnswers: 4,
      unattempted: 1,
    },
    {
      sectionId: 'sec3',
      sectionName: 'Mathematics',
      subject: Subject.MATHEMATICS,
      score: 56,
      totalMarks: 88,
      accuracy: 68.75,
      correctAnswers: 15,
      incorrectAnswers: 2,
      unattempted: 1,
    },
  ],
  subjectWise: [
    {
      subject: Subject.PHYSICS,
      score: 52,
      totalMarks: 88,
      accuracy: 65.0,
      correctAnswers: 14,
      incorrectAnswers: 3,
      unattempted: 1,
      timeTaken: 55 * 60,
    },
    {
      subject: Subject.CHEMISTRY,
      score: 48,
      totalMarks: 88,
      accuracy: 61.11,
      correctAnswers: 13,
      incorrectAnswers: 4,
      unattempted: 1,
      timeTaken: 52 * 60,
    },
    {
      subject: Subject.MATHEMATICS,
      score: 56,
      totalMarks: 88,
      accuracy: 68.75,
      correctAnswers: 15,
      incorrectAnswers: 2,
      unattempted: 1,
      timeTaken: 58 * 60,
    },
  ],
  difficultyWise: {
    easy: { correct: 12, incorrect: 1, unattempted: 0 },
    medium: { correct: 22, incorrect: 6, unattempted: 2 },
    hard: { correct: 8, incorrect: 2, unattempted: 1 },
  },
  speedAccuracy: {
    speed: 0.327,
    accuracy: 77.78,
  },
  comparison: {
    averageScore: 125.5,
    topperScore: 250,
    yourScore: 156,
  },
};

// ============================================
// Mock PYQ Data
// ============================================

export const mockPyqPapers = [
  {
    title: "JEE Mains 2024 - January Session 1",
    description: "Complete paper with detailed solutions for all 90 questions",
    badge: "New",
    metadata: [
      { label: "Date", value: "24-01-2024" },
      { label: "Questions", value: "90" },
      { label: "Marks", value: "300" },
    ],
    // Sample public PDF for testing
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    title: "JEE Mains 2024 - January Session 2",
    description: "All sessions with comprehensive step-by-step explanations",
    metadata: [
      { label: "Date", value: "27-01-2024" },
      { label: "Questions", value: "90" },
      { label: "Duration", value: "3 Hours" },
    ],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    title: "JEE Mains 2023 - April Session",
    description: "Physics, Chemistry, and Mathematics with detailed answers",
    metadata: [
      { label: "Sessions", value: "4" },
      { label: "Total Qs", value: "360" },
    ],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    title: "JEE Mains 2023 - January Session",
    description: "Complete set with topic-wise solution breakdown",
    metadata: [
      { label: "Sessions", value: "6" },
      { label: "Total Qs", value: "540" },
    ],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

export const mockSubjectWisePapers = [
  {
    title: "Physics PYQ Collection",
    description: "2015-2024 physics questions with solutions",
    badge: "1000+ Qs",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    title: "Chemistry PYQ Collection",
    description: "2015-2024 chemistry questions with solutions",
    badge: "1000+ Qs",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    title: "Mathematics PYQ Collection",
    description: "2015-2024 mathematics questions with solutions",
    badge: "1000+ Qs",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

// ============================================
// Mock Store Data
// ============================================

export const mockStoreItems = [
  {
    id: 'store1',
    title: 'Expert Counseling Session',
    description: 'One-on-one session with IIT/AIIMS graduates to plan your preparation strategy.',
    category: 'Counseling',
    price: 499,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    link: 'https://example.com/counseling',
    isRecommended: true,
  },
  {
    id: 'store2',
    title: 'College Admission Support',
    description: 'Complete guidance for JOSAA/CSAB counseling and form filling assistance.',
    category: 'Admission',
    price: 999,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    link: 'https://example.com/admission',
    isRecommended: true,
  },
  {
    id: 'store3',
    title: 'JEE Advanced Test Series',
    description: '20 Full-length mock tests with detailed video solutions and analytics.',
    category: 'Test Series',
    price: 1499,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400',
    link: 'https://example.com/test-series',
    isRecommended: false,
  },
  {
    id: 'store4',
    title: 'Personal Mentorship Plan',
    description: 'Monthly mentorship program with daily targets and performance tracking.',
    category: 'College Support',
    price: 1999,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400',
    link: 'https://example.com/mentorship',
    isRecommended: true,
  },
];

export default {
  mockUsers,
  mockTests,
  mockMyTests,
  mockDashboardStats,
  mockAnalytics,
  mockTestResult,
  mockPyqPapers,
  mockSubjectWisePapers,
  mockStoreItems,
};
