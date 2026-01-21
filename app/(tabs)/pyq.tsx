import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function PyqTabScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 
        Since this is a tab, we might want a manual header or use Stack.Screen to config the tab header.
        But typical tabs usually have their title or a custom top bar. 
        Let's use a simple custom header for consistency.
      */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Previous Year Questions</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>PYQs Coming Soon</Text>
            <Text style={styles.emptySubtext}>
                We are currently compiling previous year question papers for you. 
                Stay tuned for updates!
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100, // Space for bottom tab bar
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.xl,
  },
  grid: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: isDark ? 'rgba(96, 223, 255, 0.15)' : 'rgba(96, 223, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  subjectCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  subjectBadge: {
    fontSize: 11,
    color: BrandColors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 3,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl * 2,
    lineHeight: 24,
  },
});
