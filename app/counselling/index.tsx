/**
 * Counselling Enrollments Screen - Aspiring Engineers Mobile
 * 
 * Displays user's enrolled counselling packages with session stats
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, BrandColors, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import counsellingService from '../../src/services/counselling.service';
import { CounsellingEnrollment } from '../../src/types/counselling';

export default function CounsellingEnrollmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await counsellingService.getMyEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      console.error('Failed to fetch enrollments:', err);
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7', text: '#10B981' };
      case 'expired':
        return { bg: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6', text: '#6B7280' };
      case 'cancelled':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', text: '#EF4444' };
      default:
        return { bg: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6', text: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canBookSession = (enrollment: CounsellingEnrollment) => {
    return enrollment.status === 'active' && enrollment.sessionsRemaining > 0;
  };

  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const totalSessions = enrollments.reduce((sum, e) => sum + e.packageSnapshot.maxSessions, 0);
  const usedSessions = enrollments.reduce((sum, e) => sum + e.sessionsUsed, 0);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchEnrollments()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchEnrollments(true)}
          tintColor={BrandColors.primary}
        />
      }
    >
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
          onPress={() => router.push('/counselling/counsellors' as any)}
        >
          <Ionicons name="people-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.headerButtonText, { color: colors.textPrimary }]}>
            View Counsellors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
          onPress={() => router.push('/counselling/sessions' as any)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.headerButtonText, { color: colors.textPrimary }]}>
            My Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {enrollments.length > 0 && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: `${BrandColors.primary}20` }]}>
              <Ionicons name="bookmark" size={20} color={BrandColors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {activeEnrollments.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Active</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {totalSessions - usedSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Remaining</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="trending-up" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {usedSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Used</Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {enrollments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Ionicons name="book-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Active Enrollments
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            You don't have any counselling packages yet. Purchase a package to get started.
          </Text>
          <TouchableOpacity style={styles.browseButton}>
            <Text style={styles.browseButtonText}>Browse Packages</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Enrollments List */
        <View style={styles.enrollmentsList}>
          {enrollments.map((enrollment) => {
            const statusColors = getStatusColor(enrollment.status);
            return (
              <View
                key={enrollment._id}
                style={[styles.enrollmentCard, { backgroundColor: colors.card }]}
              >
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.packageName, { color: colors.textPrimary }]}>
                      {enrollment.packageSnapshot.name}
                    </Text>
                    <Text style={[styles.examType, { color: BrandColors.primary }]}>
                      {enrollment.packageSnapshot.examType.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Ionicons
                      name={enrollment.status === 'active' ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={statusColors.text}
                    />
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Sessions Info */}
                <View style={[styles.sessionsInfo, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                  <View style={styles.sessionStat}>
                    <Text style={[styles.sessionStatLabel, { color: colors.textMuted }]}>Used</Text>
                    <Text style={[styles.sessionStatValue, { color: colors.textPrimary }]}>
                      {enrollment.sessionsUsed}
                    </Text>
                  </View>
                  <View style={styles.sessionStatDivider} />
                  <View style={styles.sessionStat}>
                    <Text style={[styles.sessionStatLabel, { color: colors.textMuted }]}>Remaining</Text>
                    <Text style={[styles.sessionStatValue, { color: '#10B981' }]}>
                      {enrollment.sessionsRemaining}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View style={styles.datesRow}>
                  <View style={styles.dateItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      Expires: {formatDate(enrollment.expiresAt)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
                    onPress={() => router.push('/counselling/sessions' as any)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
                      View Sessions
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.primaryButton,
                      !canBookSession(enrollment) && styles.disabledButton,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: '/counselling/book-session' as any,
                        params: { enrollmentId: enrollment._id },
                      })
                    }
                    disabled={!canBookSession(enrollment)}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Book Session</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.base,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  headerButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  enrollmentsList: {
    gap: Spacing.md,
  },
  enrollmentCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  packageName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  examType: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  sessionsInfo: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sessionStat: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sessionStatLabel: {
    fontSize: FontSizes.xs,
    marginBottom: 4,
  },
  sessionStatValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  datesRow: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    fontSize: FontSizes.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: BrandColors.primary,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
