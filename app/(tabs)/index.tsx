/**
 * Dashboard Screen - Test Portal Mobile
 * 
 * Main dashboard showing user stats, upcoming tests, and quick actions.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    FontSizes,
    LightColors,
    Spacing
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch latest data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Tests Taken</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: `${LightColors.success}15` }]}>
                <Ionicons name="trending-up" size={20} color={LightColors.success} />
              </View>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: `${LightColors.warning}15` }]}>
                <Ionicons name="trophy" size={20} color={LightColors.warning} />
              </View>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Best Rank</Text>
            </View>
          </Card>
        </View>

        {/* Upcoming Tests */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={LightColors.textMuted}
              />
              <Text style={styles.emptyText}>No upcoming tests</Text>
              <Text style={styles.emptySubtext}>
                Your scheduled tests will appear here
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.emptyState}>
              <Ionicons
                name="time-outline"
                size={48}
                color={LightColors.textMuted}
              />
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>
                Take a test to see your activity here
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
  },
  userName: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: LightColors.textPrimary,
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
    color: LightColors.textPrimary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: LightColors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: LightColors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
