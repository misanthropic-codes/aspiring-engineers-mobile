/**
 * Analytics Screen - Test Portal Mobile
 * 
 * Shows user performance analytics and statistics.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { analyticsService } from '../../src/services/analytics.service';
import { UserAnalytics } from '../../src/types';


export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<UserAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const data = await analyticsService.getUserAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return colors.success;
      case 'moderate':
        return '#F59E0B';
      case 'weak':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BrandColors.primary}
          />
        }
      >
        {analytics ? (
          <>
            {/* Overview Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: `${BrandColors.primary}20` }]}>
                  <Ionicons name="document-text-outline" size={20} color={BrandColors.primary} />
                </View>
                <Text style={styles.statValue}>{analytics.overview.testsAttempted}</Text>
                <Text style={styles.statLabel}>Tests Taken</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: `${colors.success}20` }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                </View>
                <Text style={styles.statValue}>{analytics.overview.overallAccuracy.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: `${BrandColors.primary}20` }]}>
                  <Ionicons name="trophy-outline" size={20} color={BrandColors.primary} />
                </View>
                <Text style={styles.statValue}>{analytics.overview.bestScore.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Best Score</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: `${colors.warning}20` }]}>
                  <Ionicons name="time-outline" size={20} color={colors.warning || '#F59E0B'} />
                </View>
                <Text style={styles.statValue}>{analytics.overview.totalStudyTime}</Text>
                <Text style={styles.statLabel}>Study Time</Text>
              </View>
            </View>

            {/* Questions Overview */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Questions Overview</Text>
                <View style={styles.questionsRow}>
                  <View style={styles.questionsStat}>
                    <Text style={[styles.questionsValue, { color: colors.textPrimary }]}>
                      {analytics.overview.totalQuestionsAttempted}
                    </Text>
                    <Text style={styles.questionsLabel}>Attempted</Text>
                  </View>
                  <View style={styles.questionsStat}>
                    <Text style={[styles.questionsValue, { color: colors.success }]}>
                      {analytics.overview.totalCorrectAnswers}
                    </Text>
                    <Text style={styles.questionsLabel}>Correct</Text>
                  </View>
                  <View style={styles.questionsStat}>
                    <Text style={[styles.questionsValue, { color: colors.error }]}>
                      {analytics.overview.totalIncorrectAnswers}
                    </Text>
                    <Text style={styles.questionsLabel}>Incorrect</Text>
                  </View>
                  <View style={styles.questionsStat}>
                    <Text style={[styles.questionsValue, { color: colors.textMuted }]}>
                      {analytics.overview.totalUnattempted}
                    </Text>
                    <Text style={styles.questionsLabel}>Skipped</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            {analytics.subjectAnalytics.length > 0 && (
              <Card style={styles.section}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Subject Performance</Text>
                  {analytics.subjectAnalytics.map((subject) => (
                    <View key={subject.subject} style={styles.subjectRow}>
                      <View style={styles.subjectHeader}>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectName}>{subject.subject}</Text>
                          <View style={[styles.strengthBadge, { backgroundColor: `${getStrengthColor(subject.strength)}20` }]}>
                            <Text style={[styles.strengthText, { color: getStrengthColor(subject.strength) }]}>
                              {subject.strength}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.subjectAccuracy}>{subject.accuracy.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { 
                              width: `${Math.max(0, Math.min(subject.accuracy, 100))}%`,
                              backgroundColor: getStrengthColor(subject.strength)
                            }
                          ]} 
                        />
                      </View>
                      <View style={styles.subjectMeta}>
                        <Text style={styles.metaText}>
                          {subject.correctAnswers}/{subject.questionsAttempted} correct
                        </Text>
                        <Text style={styles.metaText}>
                          Avg: {subject.avgTimePerQuestion}s/q
                        </Text>
                      </View>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Topic Analytics */}
            {analytics.topicAnalytics.length > 0 && (
              <Card style={styles.section}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Topic Performance</Text>
                  {analytics.topicAnalytics.map((topic, index) => (
                    <View key={`${topic.topic}-${index}`} style={styles.topicRow}>
                      <View style={styles.topicInfo}>
                        <Text style={styles.topicName}>{topic.topic}</Text>
                        <Text style={styles.topicSubject}>{topic.subject}</Text>
                      </View>
                      <View style={styles.topicStats}>
                        <Text style={[styles.topicAccuracy, { color: getStrengthColor(topic.strength) }]}>
                          {topic.accuracy.toFixed(1)}%
                        </Text>
                        <Text style={styles.topicQuestions}>
                          {topic.correctAnswers}/{topic.questionsAttempted}
                        </Text>
                      </View>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Difficulty Analytics */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
                <View style={styles.difficultyContainer}>
                  {(['easy', 'medium', 'hard'] as const).map((level) => {
                    const data = analytics.difficultyAnalytics[level];
                    const levelColors = {
                      easy: colors.success,
                      medium: '#F59E0B',
                      hard: colors.error
                    };
                    return (
                      <View key={level} style={styles.difficultyCard}>
                        <Text style={[styles.difficultyLabel, { color: levelColors[level] }]}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                        <Text style={styles.difficultyAccuracy}>{data.accuracy.toFixed(1)}%</Text>
                        <Text style={styles.difficultyMeta}>
                          {data.correct}/{data.attempted}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </CardContent>
            </Card>

            {/* Time Analytics */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Time Analytics</Text>
                <View style={styles.timeGrid}>
                  <View style={styles.timeStat}>
                    <Text style={styles.timeValue}>{analytics.timeAnalytics.totalTimeFormatted}</Text>
                    <Text style={styles.timeLabel}>Total Time</Text>
                  </View>
                  <View style={styles.timeStat}>
                    <Text style={styles.timeValue}>{formatTime(analytics.timeAnalytics.avgTimePerTest)}</Text>
                    <Text style={styles.timeLabel}>Avg/Test</Text>
                  </View>
                  <View style={styles.timeStat}>
                    <Text style={styles.timeValue}>{analytics.timeAnalytics.avgTimePerQuestion}s</Text>
                    <Text style={styles.timeLabel}>Avg/Question</Text>
                  </View>
                  <View style={styles.timeStat}>
                    <Text style={styles.timeValue}>{analytics.timeAnalytics.questionsPerMinute.toFixed(2)}</Text>
                    <Text style={styles.timeLabel}>Q/min</Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Trend Indicator */}
            <Card style={styles.section}>
              <CardContent>
                <View style={styles.trendHeader}>
                  <Text style={styles.sectionTitle}>Performance Trend</Text>
                  <View style={[
                    styles.trendBadge,
                    { 
                      backgroundColor: analytics.trends.trend === 'improving' 
                        ? `${colors.success}20` 
                        : analytics.trends.trend === 'declining'
                        ? `${colors.error}20`
                        : `${colors.textMuted}20`
                    }
                  ]}>
                    <Ionicons 
                      name={
                        analytics.trends.trend === 'improving' 
                          ? 'trending-up' 
                          : analytics.trends.trend === 'declining'
                          ? 'trending-down'
                          : 'remove'
                      }
                      size={16}
                      color={
                        analytics.trends.trend === 'improving' 
                          ? colors.success 
                          : analytics.trends.trend === 'declining'
                          ? colors.error
                          : colors.textMuted
                      }
                    />
                    <Text style={[
                      styles.trendText,
                      { 
                        color: analytics.trends.trend === 'improving' 
                          ? colors.success 
                          : analytics.trends.trend === 'declining'
                          ? colors.error
                          : colors.textMuted
                      }
                    ]}>
                      {analytics.trends.trend.charAt(0).toUpperCase() + analytics.trends.trend.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.improvementText}>
                  Improvement: {analytics.trends.improvement}
                </Text>
              </CardContent>
            </Card>

            {/* Recent Performance */}
            {analytics.recentPerformance.length > 0 && (
              <Card style={styles.section}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Recent Tests</Text>
                  {analytics.recentPerformance.slice(0, 5).map((test, index) => (
                    <View key={`${test.testId}-${index}`} style={styles.recentTestRow}>
                      <View style={styles.recentTestInfo}>
                        <Text style={styles.recentTestTitle} numberOfLines={1}>
                          {test.title}
                        </Text>
                        <Text style={styles.recentTestDate}>
                          {new Date(test.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.recentTestScore}>
                        <Text style={[
                          styles.recentTestScoreValue,
                          { color: test.score >= 0 ? colors.success : colors.error }
                        ]}>
                          {test.score}
                        </Text>
                        <Text style={styles.recentTestTime}>
                          {formatTime(test.timeTaken)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analytics.strengthsAndWeaknesses.recommendations.length > 0 && (
              <Card style={styles.section}>
                <CardContent>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {analytics.strengthsAndWeaknesses.recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationRow}>
                      <Ionicons name="bulb-outline" size={18} color={BrandColors.primary} />
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Strengths & Weaknesses */}
            <View style={styles.strengthWeaknessContainer}>
              {analytics.strengthsAndWeaknesses.strongestTopics.length > 0 && (
                <Card style={[styles.section, { flex: 1 }]}>
                  <CardContent>
                    <View style={styles.swHeader}>
                      <Ionicons name="ribbon-outline" size={18} color={colors.success} />
                      <Text style={styles.swTitle}>Strengths</Text>
                    </View>
                    {analytics.strengthsAndWeaknesses.strongestTopics.map((topic, index) => (
                      <View key={index} style={[styles.swTag, { backgroundColor: `${colors.success}15` }]}>
                        <Text style={[styles.swTagText, { color: colors.success }]}>{topic}</Text>
                      </View>
                    ))}
                  </CardContent>
                </Card>
              )}
              {analytics.strengthsAndWeaknesses.weakestTopics.length > 0 && (
                <Card style={[styles.section, { flex: 1 }]}>
                  <CardContent>
                    <View style={styles.swHeader}>
                      <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                      <Text style={styles.swTitle}>Focus Areas</Text>
                    </View>
                    {analytics.strengthsAndWeaknesses.weakestTopics.slice(0, 3).map((topic, index) => (
                      <View key={index} style={[styles.swTag, { backgroundColor: `${colors.error}15` }]}>
                        <Text style={[styles.swTagText, { color: colors.error }]}>{topic}</Text>
                      </View>
                    ))}
                  </CardContent>
                </Card>
              )}
            </View>
          </>
        ) : (
          <Card>
            <CardContent>
              <View style={styles.emptyState}>
                <Ionicons
                  name="bar-chart-outline"
                  size={64}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Analytics Yet</Text>
                <Text style={styles.emptySubtext}>
                  Complete some tests to see your performance analytics
                </Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
    color: colors.textPrimary,
  },
  questionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionsStat: {
    alignItems: 'center',
  },
  questionsValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  questionsLabel: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  subjectRow: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subjectName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  strengthBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  strengthText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  subjectAccuracy: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  subjectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  topicSubject: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  topicStats: {
    alignItems: 'flex-end',
  },
  topicAccuracy: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  topicQuestions: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  difficultyAccuracy: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  difficultyMeta: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  timeStat: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  timeLabel: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  trendText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  improvementText: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: Spacing.sm,
  },
  recentTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentTestInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  recentTestTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  recentTestDate: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  recentTestScore: {
    alignItems: 'flex-end',
  },
  recentTestScoreValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  recentTestTime: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  strengthWeaknessContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  swHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  swTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  swTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  swTagText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
});
