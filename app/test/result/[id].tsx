import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CardContent } from '../../../src/components/ui';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../../src/constants/theme';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { resultsService } from '../../../src/services/results.service';
import { TestResult } from '../../../src/types';
import { formatPercentage, formatRank } from '../../../src/utils/formatters';


export default function ResultScreen() {
  const { id } = useLocalSearchParams(); // attemptId
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = getStyles(colors, isDark);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await resultsService.getResult(id as string);
        setResult(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load results');
        router.replace('/(tabs)');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  // Prevent back navigation to test
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  if (loading || !result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.loadingText}>Analyzing Performance...</Text>
      </View>
    );
  }

  // Helper for badge style
  const getBadgeStyle = (color: string) => ({
    backgroundColor: isDark ? `${color}20` : `${color}15`, // Darker semi-transparent bg in dark mode
    color: color
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        
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
                        {formatPercentage(result.speedAccuracy.accuracy)}
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
            {result.sectionWise.map((section) => (
                <Card key={section.sectionId} style={styles.sectionCard}>
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
    backgroundColor: colors.background, // Ensure loading background is correct
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
      backgroundColor: BrandColors.primary, // Brand color usually looks fine in dark mode too
      borderWidth: 0, // No border needed for colored card
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
      // Background color is handled inline for dynamic opacity
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
  homeButton: {
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
  }
});
