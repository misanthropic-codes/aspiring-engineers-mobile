import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuestionPalette } from '../../../src/components/test/QuestionPalette';
import { QuestionViewer } from '../../../src/components/test/QuestionViewer';
import { SaveStatus, TestHeader } from '../../../src/components/test/TestHeader';
import { GlassView } from '../../../src/components/ui/GlassView';
import { BrandColors, ColorScheme, Spacing } from '../../../src/constants/theme';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTestEngine } from '../../../src/hooks/useTestEngine';
import { useTestSecurity } from '../../../src/hooks/useTestSecurity';
import { QuestionData, StartTestResponse, SubmitAnswerItem, testService } from '../../../src/services/test.service';
import { Answer, Question, QuestionType } from '../../../src/types';


// Attempt data structure from API
interface AttemptData {
  attemptId: string;
  testId: string;
  duration: number;
  title: string;
  sections: Array<{ sectionId: string; name: string; questions: QuestionData[] }>;
}

export default function TestAttemptScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const [flatQuestions, setFlatQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [unsavedCount, setUnsavedCount] = useState(0);
  const lastSavedAnswersRef = useRef<Record<string, Answer>>({});
  
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  // Normalize question data from API
  const normalizeQuestion = (q: QuestionData, index: number): Question => {
    // API uses 'id' or 'questionId'
    const id = q.id || q.questionId || `q-${index}`;
    
    // API uses 'type' or 'questionType'
    // Map various strings to our QuestionType enum
    let type = QuestionType.MCQ_SINGLE;
    const apiType = (q.type || q.questionType || '').toUpperCase();
    
    if (apiType === 'MCQ_SINGLE' || apiType === 'SINGLE-CORRECT') {
      type = QuestionType.MCQ_SINGLE;
    } else if (apiType === 'MCQ_MULTI' || apiType === 'MCQ_MULTIPLE' || apiType === 'MULTIPLE-CORRECT') {
      type = QuestionType.MCQ_MULTIPLE;
    } else if (apiType === 'NUMERICAL' || apiType === 'INTEGER') {
      type = apiType === 'NUMERICAL' ? QuestionType.NUMERICAL : QuestionType.INTEGER;
    }

    return {
      id,
      questionNumber: q.questionNumber || index + 1,
      type,
      questionText: q.questionText,
      options: q.options || [],
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      isAnswered: q.isAnswered,
      isMarkedForReview: q.isMarkedForReview,
      savedAnswer: q.savedAnswer ? { 
        selectedOptions: typeof q.savedAnswer === 'string' ? [q.savedAnswer] : (q.savedAnswer as any).selectedOptions 
      } : undefined,
      images: q.images || (q.questionImage || q.questionImageUrl ? [q.questionImage || q.questionImageUrl!] : []),
      language: (q.language as any) || 'ENGLISH',
    };
  };

  // Initialize Test Data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await testService.startTest(id as string);
        
        // Real API returns StartTestResponse with nested data
        const apiResponse = response as StartTestResponse;
        setAttemptData({
          attemptId: apiResponse.data.attemptId,
          testId: apiResponse.data.testId,
          duration: apiResponse.data.timing.remainingTime / 60, // convert seconds to minutes
          title: apiResponse.data.test.title,
          sections: apiResponse.data.sections,
        });

        // Use normalization helper when flattening questions
        const questions = apiResponse.data.sections.flatMap(s => 
          s.questions.map((q, idx) => normalizeQuestion(q, idx))
        );
        
        setFlatQuestions(questions);
      } catch (error) {
        console.error('Error starting test:', error);
        Alert.alert('Error', 'Failed to start test');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Build answers payload from current answers
  const buildAnswersPayload = useCallback((answers: Record<string, Answer>): SubmitAnswerItem[] => {
    return Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      sectionId: 'default',
      answer: {
        selectedOptions: answer.selectedOptions,
        numericalAnswer: answer.numericalAnswer,
      },
      timeSpent: 0, // Could track per-question time if needed
    }));
  }, []);

  // Save progress handler
  const handleSaveProgress = useCallback(async (answers: Record<string, Answer>) => {
    if (!attemptData || saveStatus === 'saving') return;
    
    const payload = buildAnswersPayload(answers);
    if (payload.length === 0) return;
    
    setSaveStatus('saving');
    try {
      await testService.saveProgress(attemptData.attemptId, payload);
      lastSavedAnswersRef.current = { ...answers };
      setUnsavedCount(0);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [attemptData, saveStatus, buildAnswersPayload]);

  // Submit handler - uses answersRef to avoid dependency issues
  const answersRef = useRef<Record<string, Answer>>({});
  
  const handleSubmit = useCallback(async () => {
    if (!attemptData || submitting) return;
    
    setSubmitting(true);
    try {
      const payload = buildAnswersPayload(answersRef.current);
      console.log('📤 Submitting test payload:', payload.length, 'answers');
      
      const result = await testService.submitTest(attemptData.attemptId, { answers: payload });
      
      if (__DEV__) {
        console.log('✅ Test submitted successfully:', {
          success: result.success,
          resultId: result.data?.resultId,
          attemptId: result.data?.attemptId
        });
      }

      const resultData = result.data;
      const navigationId = resultData?.attemptId || attemptData.attemptId;

      if (navigationId) {
        console.log('➡️ Navigating to results with ID:', navigationId);
        router.replace(`/test/result/${navigationId}`);
      } else {
        console.error('❌ Could not determine navigation ID for results');
        Alert.alert('Success', 'Test submitted successfully.');
        router.replace('/');
      }
    } catch (error) {
      console.error('❌ Error submitting test:', error);
      Alert.alert('Error', 'Failed to submit test. Please check your connection.');
      setSubmitting(false);
    }
  }, [attemptData, submitting, buildAnswersPayload]);

  // Hook: Test Engine
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    timeRemaining,
    answers,
    questionStatus,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    saveAnswer,
    markForReview,
    clearResponse,
  } = useTestEngine({
    questions: flatQuestions,
    duration: attemptData ? attemptData.duration * 60 : 0,
    enabled: !!attemptData && !loading,
    onTimeUp: () => {
      Alert.alert('Time Up', 'Your test time has ended.', [
        { text: 'Submit', onPress: handleSubmit }
      ]);
    },
  });

  // Hook: Security
  const handleSecurityViolation = useCallback((reason: string) => {
    Alert.alert(
      'Security Violation',
      `${reason}. The test will be auto-submitted if you continue.`,
      [
        { text: 'I Understand', style: 'cancel' }
      ]
    );
    // In strict mode, we would call handleSubmit() directly here
  }, []);

  useTestSecurity({
    enabled: !!attemptData && !loading,
    onViolation: handleSecurityViolation,
    maxWarnings: 2,
  });

  // Prevent back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Exit Test?', 'You cannot exit the test without submitting. Submit now?', [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Submit', onPress: handleSubmit },
      ]);
      return true;
    });
    return () => backHandler.remove();
  }, [handleSubmit]);

  // Keep answersRef in sync and track unsaved count for auto-save
  useEffect(() => {
    answersRef.current = answers;
    const savedKeys = Object.keys(lastSavedAnswersRef.current);
    const currentKeys = Object.keys(answers);
    const newAnswers = currentKeys.filter(k => !savedKeys.includes(k) || answers[k] !== lastSavedAnswersRef.current[k]);
    setUnsavedCount(newAnswers.length);
    
    // Auto-save when 2+ unsaved answers
    if (newAnswers.length >= 2 && saveStatus !== 'saving') {
      handleSaveProgress(answers);
    }
  }, [answers, handleSaveProgress, saveStatus]);

  // Manual save handler
  const handleManualSave = useCallback(() => {
    if (Object.keys(answers).length > 0) {
      handleSaveProgress(answers);
    }
  }, [answers, handleSaveProgress]);

  const handlePaletteSelect = (index: number) => {
    goToQuestion(index);
    setShowPalette(false);
  };

  if (loading || !attemptData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>Loading Test...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      
      <TestHeader
        testTitle={attemptData.title}
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
        onTogglePalette={() => setShowPalette(!showPalette)}
        showPalette={showPalette}
        saveStatus={saveStatus}
        onSave={handleManualSave}
        unsavedCount={unsavedCount}
      />

      <View style={styles.content}>
        {showPalette && (
            <GlassView style={styles.paletteOverlay} intensity={95}>
                <QuestionPalette
                  totalQuestions={totalQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  questionStatus={questionStatus}
                  questions={flatQuestions}
                  onQuestionSelect={handlePaletteSelect}
                  isVisible={true}
                />
            </GlassView>
        )}

        <QuestionViewer
          question={currentQuestion}
          answer={answers[currentQuestion?.id]}
          onAnswerChange={saveAnswer}
        />
      </View>
      
      {/* Bottom Navigation */}
      <GlassView 
        style={[styles.bottomBar, { paddingBottom: Math.max(Spacing.md, insets.bottom) }]}
        intensity={80}
      >
        <TouchableOpacity onPress={clearResponse} style={styles.actionButton}>
             <Text style={styles.actionText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={markForReview} style={styles.actionButton}>
             <Ionicons 
                name={questionStatus[currentQuestion?.id || ''] === 'MARKED_FOR_REVIEW' || questionStatus[currentQuestion?.id || ''] === 'ANSWERED_AND_MARKED' ? "bookmark" : "bookmark-outline"} 
                size={18} 
                color={BrandColors.primary} 
             />
             <Text style={styles.actionText}>Mark</Text>
        </TouchableOpacity>

        <View style={styles.navButtons}>
            <TouchableOpacity 
                onPress={prevQuestion} 
                disabled={currentQuestionIndex === 0}
                style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            >
                <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? colors.textMuted : '#fff'} />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={nextQuestion} 
                disabled={currentQuestionIndex === totalQuestions - 1}
                style={[styles.navButton, currentQuestionIndex === totalQuestions - 1 && styles.navButtonDisabled]}
            >
                <Ionicons name="chevron-forward" size={20} color={currentQuestionIndex === totalQuestions - 1 ? colors.textMuted : '#fff'} />
                <Text style={[styles.navButtonText, currentQuestionIndex === totalQuestions - 1 && styles.textDisabled]}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Last' : 'Next'}
                </Text>
            </TouchableOpacity>
        </View>
      </GlassView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  paletteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // On iOS, background is transparent to show blur. On Android, fallback to color.
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // On iOS, transparent. On Android, solid.
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: Spacing.sm,
  },
  actionText: {
    color: BrandColors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  navButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButtonDisabled: {
    backgroundColor: colors.border,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  textDisabled: {
      color: colors.textMuted
  }
});
