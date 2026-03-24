import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CardContent } from '@/src/components/ui';
import { HtmlText } from '@/src/components/common/HtmlText';
import { MathRenderer } from '@/src/components/common/MathRenderer';
import { ImagePreviewModal } from '@/src/components/common/ImagePreviewModal';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '@/src/constants/theme';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { resultsService, AnswerKeyResponse } from '@/src/services/results.service';
import { TestResult, AnswerKeyQuestion } from '@/src/types';
import { formatPercentage, formatRank } from '@/src/utils/formatters';
import { hasLatex } from '@/src/utils/latex.utils';
import { resolveImageUrl } from '@/src/utils/url.utils';


export default function ResultScreen() {
  const { id } = useLocalSearchParams(); // attemptId
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || authLoading) return;
        
        if (!isAuthenticated) {
          router.replace('/(auth)/login');
          return;
        }

        setLoading(true);
        const [resultData, keyData] = await Promise.all([
          resultsService.getResult(id as string),
          resultsService.getAnswerKey(id as string)
        ]);
        
        setResult(resultData);
        setAnswerKey(keyData.data);
      } catch (error) {
        console.error('Error loading results:', error);
        Alert.alert('Error', 'Failed to load results');
        router.replace('/(tabs)');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, authLoading, isAuthenticated]);

  // Prevent back navigation to test
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  if (loading || authLoading || !result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>Analyzing Performance...</Text>
      </View>
    );
  }

  const renderOption = (question: AnswerKeyQuestion, option: any, index: number) => {
    const optionLabel = String.fromCharCode(65 + index);
    const isSelected = question.yourAnswer?.selectedOptions?.includes(optionLabel);
    const isUnattempted = !question.yourAnswer?.selectedOptions?.length;
    
    // 4-state highlighting logic matching web
    const isCorrectFromApi = option.isCorrect;
    const isCorrectFromUserRight = !!(isSelected && question.isCorrect);
    const isCorrectFromCorrectAnswer = question.correctAnswer?.selectedOptions?.includes(optionLabel);
    const isCorrectOpt = isCorrectFromApi || isCorrectFromUserRight || !!isCorrectFromCorrectAnswer;

    let optionStyle = [styles.optionCard];
    let markerStyle = [styles.optionMarker];
    let badge: React.ReactNode = null;

    if (isSelected && question.isCorrect) {
      // Correct
      optionStyle.push({ backgroundColor: colors.successLight, borderColor: colors.success } as any);
      markerStyle.push({ backgroundColor: colors.success, borderColor: colors.success } as any);
      badge = <Text style={[styles.badgeText, { color: colors.success }]}>✓ Correct</Text>;
    } else if (isSelected && !question.isCorrect) {
      // Wrong
      optionStyle.push({ backgroundColor: colors.errorLight, borderColor: colors.error } as any);
      markerStyle.push({ backgroundColor: colors.error, borderColor: colors.error } as any);
      badge = <Text style={[styles.badgeText, { color: colors.error }]}>✗ Your answer</Text>;
    } else if (isCorrectOpt && !question.isCorrect) {
      // This is the correct option on a wrong or skipped question
      if (isUnattempted) {
        // Skipped -> Yellow
        optionStyle.push({ backgroundColor: colors.warningLight, borderColor: colors.warning } as any);
        markerStyle.push({ backgroundColor: colors.warning, borderColor: colors.warning } as any);
        badge = <Text style={[styles.badgeText, { color: colors.warning }]}>● Correct answer</Text>;
      } else {
        // Wrong -> Green (show correct one)
        optionStyle.push({ backgroundColor: colors.successLight, borderColor: colors.success } as any);
        markerStyle.push({ backgroundColor: colors.success, borderColor: colors.success } as any);
        badge = <Text style={[styles.badgeText, { color: colors.success }]}>✓ Correct answer</Text>;
      }
    }

    return (
      <View key={index} style={optionStyle}>
        <View style={markerStyle}>
          <Text style={[styles.optionLabel, (isSelected || isCorrectOpt) && { color: '#fff' }]}>{optionLabel}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {hasLatex(option.text) ? (
            <MathRenderer 
              content={option.text} 
              style={styles.optionText} 
              baseSize={14} 
            />
          ) : (
            <HtmlText 
              html={option.text || `Option ${optionLabel}`} 
              style={styles.optionText} 
              baseSize={14} 
            />
          )}
        </View>
        {badge}
      </View>
    );
  };

  const renderQuestionCard = (question: AnswerKeyQuestion) => (
    <Card key={question.questionId} style={styles.questionCard}>
      <CardContent>
        <View style={styles.qHeader}>
          <Text style={styles.qNumber}>Question {question.questionNumber}</Text>
          <View style={[styles.statusTag, { backgroundColor: question.isCorrect ? '#ecfdf5' : question.yourAnswer?.selectedOptions?.length ? '#fef2f2' : '#fef3c7' }]}>
             <Text style={[styles.statusTagText, { color: question.isCorrect ? '#059669' : question.yourAnswer?.selectedOptions?.length ? '#dc2626' : '#d97706' }]}>
               {question.isCorrect ? 'Correct' : question.yourAnswer?.selectedOptions?.length ? 'Incorrect' : 'Skipped'}
             </Text>
          </View>
        </View>

        <MathRenderer 
          content={question.questionText} 
          style={styles.qText} 
          baseSize={15} 
        />

        {(() => {
          const imageUrl = resolveImageUrl((question as any).questionImage || question.questionImageUrl);
          const images = (question as any).images || [];
          
          return (
            <View style={styles.imageContainer}>
              {imageUrl && (
                <TouchableOpacity onPress={() => setPreviewImage(imageUrl)} activeOpacity={0.9}>
                  <Image source={{ uri: imageUrl }} style={styles.qImage} resizeMode="contain" />
                </TouchableOpacity>
              )}
              {Array.isArray(images) && images.map((img: string, idx: number) => {
                const resUrl = resolveImageUrl(img);
                if (!resUrl) return null;
                return (
                  <TouchableOpacity key={`rq-img-wrap-${idx}`} onPress={() => setPreviewImage(resUrl)} activeOpacity={0.9}>
                    <Image key={`rq-img-${idx}`} source={{ uri: resUrl }} style={styles.qImage} resizeMode="contain" />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })()}

        <View style={styles.optionsContainer}>
          {question.options.map((opt, idx) => renderOption(question, opt, idx))}
        </View>

        {(question.solutionText || question.solutionImageUrl) && (
          <View style={styles.solutionContainer}>
            <Text style={styles.solutionTitle}>Solution:</Text>
            {question.solutionText && (
              <MathRenderer 
                content={question.solutionText} 
                baseSize={14}
              />
            )}
            {question.solutionImageUrl && (
              <TouchableOpacity onPress={() => setPreviewImage(resolveImageUrl(question.solutionImageUrl))} activeOpacity={0.9}>
                <Image source={{ uri: resolveImageUrl(question.solutionImageUrl) || '' }} style={styles.solutionImage} resizeMode="contain" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImagePreviewModal 
        isVisible={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />
      <View style={styles.header}>
            <Text style={styles.headerTitle}>Test Result</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            {/* Summary Card */}
            <Card style={styles.summaryCard}>
                <CardContent>
                    <Text style={styles.testTitle}>{result.testTitle}</Text>
                    <View style={styles.mainStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{result.score}/{result.totalMarks}</Text>
                            <Text style={styles.statLabel}>Score</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatRank(result.rank)}</Text>
                            <Text style={styles.statLabel}>Rank</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatPercentage(result.percentile)}</Text>
                            <Text style={styles.statLabel}>Percentile</Text>
                        </View>
                    </View>
                </CardContent>
            </Card>

            {/* Performance Overview */}
            <View style={styles.overviewContainer}>
                <View style={[styles.overviewCard, { backgroundColor: isDark ? `${colors.success}15` : '#DCFCE7' }]}>
                    <Text style={[styles.overviewValue, { color: colors.success }]}>
                        {formatPercentage(typeof result.speedAccuracy.accuracy === 'string' ? parseFloat(result.speedAccuracy.accuracy) : result.speedAccuracy.accuracy)}
                    </Text>
                    <Text style={styles.overviewLabel}>Accuracy</Text>
                </View>
                 <View style={[styles.overviewCard, { backgroundColor: isDark ? `${colors.info}15` : '#DBEAFE' }]}>
                    <Text style={[styles.overviewValue, { color: colors.info }]}>
                        {result.timeTaken}m
                    </Text>
                    <Text style={styles.overviewLabel}>Time Taken</Text>
                </View>
            </View>

            {/* Section Breakdown */}
            <Text style={styles.sectionHeader}>Section Analysis</Text>
            {result.sectionWise.map((section, idx) => (
                <Card key={idx} style={styles.sectionCard}>
                    <CardContent>
                         <View style={styles.sectionTitleRow}>
                             <Text style={styles.sectionName}>{section.sectionName}</Text>
                             <Text style={styles.sectionScore}>{section.score}/{section.totalMarks}</Text>
                         </View>
                         
                         <View style={styles.progressRow}>
                             <View style={styles.progressItem}>
                                 <View style={[styles.dot, { backgroundColor: colors.success }]} />
                                 <Text style={styles.progressText}>{section.correctAnswers} Correct</Text>
                             </View>
                             <View style={styles.progressItem}>
                                 <View style={[styles.dot, { backgroundColor: colors.error }]} />
                                 <Text style={styles.progressText}>{section.incorrectAnswers} Wrong</Text>
                             </View>
                             <View style={styles.progressItem}>
                                 <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
                                 <Text style={styles.progressText}>{section.unattempted} Skipped</Text>
                             </View>
                         </View>
                    </CardContent>
                </Card>
            ))}

            {/* Answer Key Section */}
            {answerKey && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>Answer Key & Solutions</Text>
                {answerKey.sections.map(section => (
                  <View key={section.sectionId}>
                    {answerKey.sections.length > 1 && (
                      <Text style={styles.sectionSubHeader}>{section.sectionName}</Text>
                    )}
                    {section.questions.map(renderQuestionCard)}
                  </View>
                ))}
              </>
            )}

            <Button 
                onPress={() => router.replace('/(tabs)')}
                style={styles.homeButton}
            >
                Back to Dashboard
            </Button>

        </ScrollView>
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
    fontSize: FontSizes.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitle: {
      fontSize: FontSizes.lg,
      fontWeight: 'bold',
      color: colors.textPrimary,
  },
  closeButton: {
      padding: 4,
  },
  content: {
    padding: Spacing.md,
  },
  summaryCard: {
      marginBottom: Spacing.lg,
      backgroundColor: BrandColors.primary,
      borderWidth: 0,
  },
  testTitle: {
      fontSize: FontSizes.lg,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: Spacing.lg,
  },
  mainStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  statItem: {
      alignItems: 'center',
      flex: 1,
  },
  statValue: {
      fontSize: FontSizes['2xl'],
      fontWeight: 'bold',
      color: '#fff',
  },
  statLabel: {
      fontSize: FontSizes.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
  },
  statDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  overviewContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
  },
  overviewCard: {
      flex: 1,
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
  },
  overviewValue: {
      fontSize: FontSizes.xl,
      fontWeight: 'bold',
      marginBottom: 2,
  },
  overviewLabel: {
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
  },
  sectionHeader: {
      fontSize: FontSizes.lg,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  sectionSubHeader: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  sectionCard: {
      marginBottom: Spacing.md,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
  },
  sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
  },
  sectionName: {
      fontSize: FontSizes.base,
      fontWeight: '600',
      color: colors.textPrimary,
  },
  sectionScore: {
      fontSize: FontSizes.base,
      fontWeight: 'bold',
      color: BrandColors.primary,
  },
  progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  progressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
  },
  progressText: {
      fontSize: FontSizes.xs,
      color: colors.textSecondary,
  },
  questionCard: {
    marginBottom: Spacing.lg,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  qNumber: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  qText: {
    color: colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  qImage: {
    width: '100%',
    height: 200,
    marginBottom: Spacing.md,
    borderRadius: 8,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: Spacing.md,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  optionText: {
    color: colors.textPrimary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  solutionContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  solutionText: {
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  solutionImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  homeButton: {
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
  }
});
