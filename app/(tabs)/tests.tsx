/**
 * Tests Screen - Test Portal Mobile
 * 
 * Lists available tests for the user.
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CardContent } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { testService } from '../../src/services/test.service';
import { MyTest, TestCategory, MyTestsStats } from '../../src/types';


import { useAuth } from '../../src/contexts/AuthContext';


export default function TestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [tests, setTests] = React.useState<MyTest[]>([]);
  const [categories, setCategories] = React.useState<TestCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [stats, setStats] = React.useState<MyTestsStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchTests = React.useCallback(async () => {
    try {
      if (authLoading) return;
      if (!isAuthenticated) return;
      
      const response = await testService.getMyTests();
      if (response && response.categories) {
        setStats(response.stats);
        setCategories(response.categories);
        
        // Flatten all tests from categories
        const allTests = response.categories.flatMap(cat => cat.tests);
        setTests(allTests);
      } else {
        setTests([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authLoading, isAuthenticated]);

  React.useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTests();
  }, [fetchTests]);

  const filteredTests = useMemo(() => {
    if (selectedCategory === 'ALL') return tests;
    return tests.filter(t => t.category === selectedCategory);
  }, [tests, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tests</Text>
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
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalTests}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedTests}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.notStarted}</Text>
              <Text style={styles.statLabel}>New</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(stats.overallAverage ?? 0).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Avg</Text>
            </View>
          </View>
        )}

        {categories.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity 
              onPress={() => setSelectedCategory('ALL')}
              style={[
                styles.categoryTab, 
                selectedCategory === 'ALL' && styles.categoryTabActive
              ]}
            >
              <Text style={[
                styles.categoryTabText, 
                selectedCategory === 'ALL' && styles.categoryTabTextActive
              ]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.category}
                onPress={() => setSelectedCategory(cat.category)}
                style={[
                  styles.categoryTab, 
                  selectedCategory === cat.category && styles.categoryTabActive
                ]}
              >
                <Text style={[
                  styles.categoryTabText, 
                  selectedCategory === cat.category && styles.categoryTabTextActive
                ]}>{cat.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading && tests.length === 0 ? (
          <Text style={styles.loadingText}>Loading tests...</Text>
        ) : filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <Card key={test.testId} style={styles.testCard}>
              <CardContent>
                <View style={styles.testHeader}>
                  <View style={styles.testIcon}>
                    <Ionicons name="school-outline" size={24} color={BrandColors.primary} />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    <Text style={styles.testExamType}>{test.category} • {test.type}</Text>
                  </View>
                  {test.progress && (
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: test.progress === 'completed' ? `${colors.success}15` : test.progress === 'in-progress' ? `${colors.warning}15` : `${colors.textMuted}10` }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: test.progress === 'completed' ? colors.success : test.progress === 'in-progress' ? colors.warning : colors.textMuted }
                      ]}>
                        {test.progress === 'completed' ? 'Completed' : test.progress === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.testDescription} numberOfLines={2}>
                  {test.description}
                </Text>

                <View style={styles.testMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{test.duration} mins</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="ribbon-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{test.totalMarks} Marks</Text>
                  </View>
                  {test.bestPercentage !== undefined && test.hasAttempted && (
                    <View style={styles.metaItem}>
                      <Ionicons name="star-outline" size={16} color={colors.success} />
                      <Text style={[styles.metaText, { color: colors.success, fontWeight: 'bold' }]}>
                        {test.bestPercentage.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>

                <Button
                  onPress={() => router.push(`/test/attempt/${test.testId}`)}
                  style={styles.startButton}
                  size="sm"
                >
                  {test.hasAttempted ? 'Retake Test' : 'Start Test'}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Tests Available</Text>
                <Text style={styles.emptySubtext}>
                  Your purchased and assigned tests will appear here
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
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    color: colors.textMuted,
  },
  testCard: {
    marginBottom: Spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  testHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  testInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  testTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  testExamType: {
    fontSize: FontSizes.xs,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  testDescription: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  testMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: FontSizes.xs,
  },
  startButton: {
    marginTop: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  categoriesScroll: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#fff',
  },
});
