/**
 * Analytics Screen - Test Portal Mobile
 * 
 * Shows user performance analytics and statistics.
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
import { Card, CardContent } from '../../src/components/ui';
import {
    BrandColors,
    FontSizes,
    LightColors,
    Spacing,
} from '../../src/constants/theme';

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch analytics
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
        <Card>
          <CardContent>
            <View style={styles.emptyState}>
              <Ionicons
                name="bar-chart-outline"
                size={64}
                color={LightColors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Analytics Yet</Text>
              <Text style={styles.emptySubtext}>
                Complete some tests to see your performance analytics
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
  header: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: LightColors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: LightColors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
