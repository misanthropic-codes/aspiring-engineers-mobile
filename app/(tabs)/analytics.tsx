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
import { API_CONFIG } from '../../src/config/api.config';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { mockAnalyticsService } from '../../src/mocks';
import { analyticsService } from '../../src/services/analytics.service';
import { UserAnalytics } from '../../src/types';

const getAnalyticsService = () => API_CONFIG.USE_MOCK ? mockAnalyticsService : analyticsService;

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<UserAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const service = getAnalyticsService();
      const data = await service.getUserAnalytics();
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
            <View style={styles.statsRow}>
              <Card style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{analytics.totalTests}</Text>
                  <Text style={styles.statLabel}>Tests Taken</Text>
                </View>
              </Card>
              <Card style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{analytics.averageScore.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg Score</Text>
                </View>
              </Card>
              <Card style={styles.statCard} variant="elevated">
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{analytics.averagePercentile.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avg %ile</Text>
                </View>
              </Card>
            </View>

            {/* Subject Performance */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Subject Performance</Text>
                {analytics.subjectWise.map((subject) => (
                  <View key={subject.subject} style={styles.subjectRow}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{subject.subject}</Text>
                      <Text style={styles.subjectScore}>Avg: {subject.averageScore.toFixed(1)}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${Math.min(subject.accuracy, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.accuracyText}>{subject.accuracy.toFixed(1)}% Acc</Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Areas for Improvement</Text>
                <View style={styles.tagsContainer}>
                  {analytics.weaknesses.map((weakness, index) => (
                    <View key={index} style={styles.tag}>
                       <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                      <Text style={styles.tagText}>{weakness}</Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card style={styles.section}>
              <CardContent>
                <Text style={styles.sectionTitle}>Strong Areas</Text>
                <View style={styles.tagsContainer}>
                  {analytics.strengths.map((strength, index) => (
                    <View key={index} style={[styles.tag, styles.strengthTag]}>
                       <Ionicons name="ribbon-outline" size={16} color={colors.success} />
                      <Text style={[styles.tagText, styles.strengthText]}>{strength}</Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  statContent: {
    alignItems: 'center',
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
  subjectRow: {
    marginBottom: Spacing.md,
  },
  subjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subjectScore: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.full,
  },
  accuracyText: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  tagText: {
    fontSize: FontSizes.sm,
    color: colors.error,
  },
  strengthTag: {
    backgroundColor: `${colors.success}15`,
  },
  strengthText: {
    color: colors.success,
  },
});
