/**
 * Dashboard Screen - Test Portal Mobile
 * 
 * Main dashboard showing user stats, upcoming tests, and quick actions.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui';
import { API_CONFIG } from '../../src/config/api.config';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext'; // Import theme hook
import { mockDashboardService } from '../../src/mocks';
import { dashboardService } from '../../src/services/dashboard.service';
import { DashboardStats } from '../../src/types';

const getDashboardService = () => API_CONFIG.USE_MOCK ? mockDashboardService : dashboardService;

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme(); // Use theme
  const styles = useMemo(() => getStyles(colors), [colors]); // Dynamic styles

  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
    try {
      const service = getDashboardService();
      const data = await service.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color={BrandColors.primary} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: `${BrandColors.primary}15` }]}>
                <Ionicons name="book" size={20} color={BrandColors.primary} />
              </View>
              <Text style={styles.statValue}>{stats?.testsThisWeek || 0}</Text>
              <Text style={styles.statLabel}>Tests This Week</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? `${colors.success}20` : `${colors.success}15` }]}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{stats?.averageScoreThisWeek || '-'}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? `${colors.warning}20` : `${colors.warning}15` }]}>
                <Ionicons name="time" size={20} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{stats ? Math.round(stats.weekStudyTime / 60) : '-'}</Text>
              <Text style={styles.statLabel}>Study Hours</Text>
            </View>
          </Card>
        </View>

        {/* Upcoming Tests */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.upcomingTests && stats.upcomingTests.length > 0 ? (
              stats.upcomingTests.map((test) => (
                <TouchableOpacity 
                  key={test.testId} 
                  style={styles.testItem}
                  onPress={() => router.push(`/test/attempt/${test.testId}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.testIcon}>
                    <Ionicons name="calendar" size={20} color={BrandColors.primary} />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle} numberOfLines={1}>{test.title}</Text>
                    <Text style={styles.testTime}>
                      {new Date(test.scheduledAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>No upcoming tests</Text>
                <Text style={styles.emptySubtext}>
                  Your scheduled tests will appear here
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.activityItem}
                    onPress={() => router.push(`/test/result/${activity.attemptId}`)}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.testTitle}</Text>
                    <Text style={styles.activityTime}>
                      Completed on {new Date(activity.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="time-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>No recent activity</Text>
                <Text style={styles.emptySubtext}>
                  Take a test to see your activity here
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
  },
  userName: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  testIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  testTime: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  activityInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  activityTime: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
