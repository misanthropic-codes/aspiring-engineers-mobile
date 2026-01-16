import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuestionPalette } from '../../../src/components/test/QuestionPalette';
import { QuestionViewer } from '../../../src/components/test/QuestionViewer';
import { TestHeader } from '../../../src/components/test/TestHeader';
import { API_CONFIG } from '../../../src/config/api.config';
import { BrandColors, LightColors, Spacing } from '../../../src/constants/theme';
import { useTestEngine } from '../../../src/hooks/useTestEngine';
import { useTestSecurity } from '../../../src/hooks/useTestSecurity';
import { mockTestService } from '../../../src/mocks';
import { testService } from '../../../src/services/test.service';
import { Question, TestAttempt } from '../../../src/types';

const getTestService = () => API_CONFIG.USE_MOCK ? mockTestService : testService;

export default function TestAttemptScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [flatQuestions, setFlatQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  // Initialize Test Data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const service = getTestService();
        // In real scenario, we might check if there's an existing attempt or start a new one
        // For now, we assume startTest creates or resumes
        const data = await service.startTest(id as string);
        
        setAttempt(data);
        const questions = data.sections.flatMap(s => s.questions);
        setFlatQuestions(questions);
      } catch (error) {
        Alert.alert('Error', 'Failed to start test');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!attempt || submitting) return;
    
    setSubmitting(true);
    try {
      const service = getTestService();
      await service.submitTest(attempt.attemptId);
      // Clean up local mock state or handle real backend response
      
      // Navigate to result screen
      // We pass the attemptId which is used to fetch results
      // In mock service, getResult expects attemptId
      router.replace(`/test/result/${attempt.attemptId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit test');
      setSubmitting(false);
    }
  }, [attempt, submitting]);

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
    duration: attempt ? attempt.duration * 60 : 0,
    enabled: !!attempt && !loading,
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
    enabled: !!attempt && !loading,
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

  const handlePaletteSelect = (index: number) => {
    goToQuestion(index);
    setShowPalette(false);
  };

  if (loading || !attempt) {
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
        testTitle="Test Attempt" // You might want to get this from somewhere
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
        onTogglePalette={() => setShowPalette(!showPalette)}
        showPalette={showPalette}
      />

      <View style={styles.content}>
        {showPalette && (
            <View style={styles.paletteOverlay}>
                <QuestionPalette
                  totalQuestions={totalQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  questionStatus={questionStatus}
                  questions={flatQuestions}
                  onQuestionSelect={handlePaletteSelect}
                  isVisible={true}
                />
            </View>
        )}

        <QuestionViewer
          question={currentQuestion}
          answer={answers[currentQuestion?.id]}
          onAnswerChange={saveAnswer}
        />
      </View>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(Spacing.md, insets.bottom) }]}>
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
                <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? LightColors.textMuted : '#fff'} />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={nextQuestion} 
                disabled={currentQuestionIndex === totalQuestions - 1}
                style={[styles.navButton, currentQuestionIndex === totalQuestions - 1 && styles.navButtonDisabled]}
            >
                <Ionicons name="chevron-forward" size={20} color={currentQuestionIndex === totalQuestions - 1 ? LightColors.textMuted : '#fff'} />
                <Text style={[styles.navButtonText, currentQuestionIndex === totalQuestions - 1 && styles.textDisabled]}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Last' : 'Next'}
                </Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightColors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: LightColors.textPrimary,
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
    backgroundColor: LightColors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
    backgroundColor: LightColors.background,
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
    backgroundColor: LightColors.border,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  textDisabled: {
      color: LightColors.textMuted
  }
});
