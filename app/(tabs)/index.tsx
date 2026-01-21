/**
 * Dashboard Screen - Test Portal Mobile
 * 
 * Main dashboard showing user stats, purchased packages, and quick actions.
 * Matches test-portal-client dashboard API endpoints.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui';
import {
  BorderRadius,
  BrandColors,
  ColorScheme,
  FontSizes,
  Spacing,
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { PurchasedPackage, purchasesService } from '../../src/services/purchases.service';
import { testService } from '../../src/services/test.service';
import { MyTestsResponse } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  // Purchased content
  const [packages, setPackages] = React.useState<PurchasedPackage[]>([]);
  const [totalSpent, setTotalSpent] = React.useState(0);
  const [totalPurchases, setTotalPurchases] = React.useState(0);
  
  // My Tests data
  const [myTestsData, setMyTestsData] = React.useState<MyTestsResponse | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Use refreshProfile from AuthContext to update global state
      // This internally calls userService.getUserProfile and updates 'user'
      await refreshProfile();
      
      if (__DEV__) {
        console.log('📊 Dashboard stats refreshed via AuthContext');
      }

      // Fetch purchased packages
      const purchasedData = await purchasesService.getPurchasedContent();
      setPackages(purchasedData.purchasedPackages);
      setTotalSpent(purchasedData.totalSpent);
      setTotalPurchases(purchasedData.totalPurchases);
      
      // Fetch my tests stats
      const myTests = await testService.getMyTests();
      setMyTestsData(myTests);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshProfile]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

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
              <Text style={styles.statValue}>{user?.stats?.testsAttempted || 0}</Text>
              <Text style={styles.statLabel}>Tests Taken</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? `${colors.success}20` : `${colors.success}15` }]}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{user?.stats?.averageScore ? `${user.stats.averageScore.toFixed(0)}%` : '-'}</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: isDark ? `${colors.warning}20` : `${colors.warning}15` }]}>
                <Ionicons name="time" size={20} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{user?.stats?.totalStudyHours || '-'}</Text>
              <Text style={styles.statLabel}>Study Hours</Text>
            </View>
          </Card>
        </View>

        {/* Purchased Packages Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Purchased Packages</Text>
          <TouchableOpacity onPress={() => router.push('/store')}>
            <Text style={styles.viewAllText}>Browse More</Text>
          </TouchableOpacity>
        </View>

        {packages.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packagesScroll}
          >
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.packageId}
                style={styles.packageCard}
                onPress={() => router.push(`/packages/${pkg.packageId}`)}
              >
                <Image
                  source={{ uri: pkg.thumbnail || 'https://via.placeholder.com/300x150' }}
                  style={styles.packageThumbnail}
                />
                <View style={styles.packageContent}>
                  <Text style={styles.packageCategory}>{pkg.category}</Text>
                  <Text style={styles.packageNameTitle} numberOfLines={2}>
                    {pkg.packageName}
                  </Text>
                  <Text style={styles.packageTestsCount}>
                    {pkg.tests.length} test{pkg.tests.length !== 1 ? 's' : ''} available
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Card style={styles.section}>
            <CardContent>
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No purchased packages yet</Text>
                <TouchableOpacity 
                  style={styles.browseButton}
                  onPress={() => router.push('/store')}
                >
                  <Text style={styles.browseButtonText}>Explore Store</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Recent Performance */}
        <Card style={styles.section}>
          <CardHeader>
            <CardTitle>My Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/analytics')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="analytics" size={24} color={colors.success} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Detailed Analytics</Text>
                <Text style={styles.actionDesc}>Check your subject-wise performance</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/tests')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${BrandColors.primary}15` }]}>
                <Ionicons name="list" size={24} color={BrandColors.primary} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Available Tests</Text>
                <Text style={styles.actionDesc}>Browse and take new tests</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: FontSizes.sm,
    color: BrandColors.primary,
    fontWeight: '600',
  },
  packagesScroll: {
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  packageCard: {
    width: 260,
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  packageThumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  packageContent: {
    padding: Spacing.md,
  },
  packageCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BrandColors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  packageNameTitle: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    height: 40,
  },
  packageTestsCount: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
  browseButton: {
    marginTop: Spacing.md,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionDesc: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
