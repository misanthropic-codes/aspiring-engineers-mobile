/**
 * Counsellors Screen - Aspiring Engineers Mobile
 * 
 * Displays list of available counsellors with their profiles.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
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
import { Counsellor } from '../../src/types/counselling';

export default function CounsellorsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounsellors = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await counsellingService.getAvailableCounsellors();
      setCounsellors(data);
    } catch (err: any) {
      console.error('Failed to fetch counsellors:', err);
      setError(err.message || 'Failed to load counsellors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

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
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchCounsellors()}>
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
          onRefresh={() => fetchCounsellors(true)}
          tintColor={BrandColors.primary}
        />
      }
    >
      {/* Header Text */}
      <View style={styles.header}>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Expert guidance from experienced professionals to help you succeed
        </Text>
      </View>

      {/* Counsellors Grid */}
      {counsellors.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Counsellors Available
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Please check back later for available counsellors.
          </Text>
        </View>
      ) : (
        <View style={styles.counsellorsList}>
          {counsellors.map((counsellor) => (
            <View
              key={counsellor._id}
              style={[styles.counsellorCard, { backgroundColor: colors.card }]}
            >
              {/* Profile Header */}
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {counsellor.image ? (
                    <Image
                      source={{ uri: counsellor.image }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: BrandColors.primary }]}>
                      <Text style={styles.avatarText}>
                        {counsellor.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.counsellorName, { color: colors.textPrimary }]}>
                    {counsellor.name}
                  </Text>
                  <Text style={[styles.specialization, { color: BrandColors.primary }]}>
                    {counsellor.specialization}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {counsellor.experience} Years
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {counsellor.rating} ({counsellor.totalSessions} sessions)
                  </Text>
                </View>
              </View>

              {/* About */}
              <Text
                style={[styles.aboutText, { color: colors.textMuted }]}
                numberOfLines={3}
              >
                {counsellor.about}
              </Text>
            </View>
          ))}
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
  header: {
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  counsellorsList: {
    gap: Spacing.md,
  },
  counsellorCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  specialization: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSizes.sm,
  },
  aboutText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
