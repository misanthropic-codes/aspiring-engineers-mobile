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
import { Test } from '../../src/types';


export default function TestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [refreshing, setRefreshing] = React.useState(false);
  const [tests, setTests] = React.useState<Test[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTests = React.useCallback(async () => {
    try {
      const data = await testService.getAllTests();
      setTests(data?.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTests();
  }, [fetchTests]);

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
        {loading && tests.length === 0 ? (
          <Text style={styles.loadingText}>Loading tests...</Text>
        ) : tests.length > 0 ? (
          tests.map((test) => (
            <Card key={test.id} style={styles.testCard}>
              <CardContent>
                <View style={styles.testHeader}>
                  <View style={styles.testIcon}>
                    <Ionicons name="school-outline" size={24} color={BrandColors.primary} />
                  </View>
                  <View style={styles.testInfo}>
                    <Text style={styles.testTitle}>{test.title}</Text>
                    <Text style={styles.testExamType}>{test.examType} • {test.difficulty}</Text>
                  </View>
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
                    <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{test.totalQuestions} Questions</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="ribbon-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{test.totalMarks} Marks</Text>
                  </View>
                </View>

                <Button
                  onPress={() => router.push(`/test/attempt/${test.id}`)}
                  style={styles.startButton}
                  size="sm"
                >
                  Start Test
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
});
