/**
 * About Screen - Test Portal Mobile
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="school" size={60} color={BrandColors.primary} />
          </View>
          <Text style={styles.appName}>Aspiring Engineers</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            Aspiring Engineers is dedicated to providing high-quality mock tests and study materials for JEE Main and JEE Advanced aspirants. Our platform aims to simulate the real exam environment to help students prepare effectively and gain confidence.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>What's New</Text>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={16} color={BrandColors.primary} />
            <Text style={styles.bulletText}>Full API integration for real data</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={16} color={BrandColors.primary} />
            <Text style={styles.bulletText}>Revamped test-taking mechanism</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="checkmark-circle" size={16} color={BrandColors.primary} />
            <Text style={styles.bulletText}>Detailed performance analytics</Text>
          </View>
        </Card>

        <Text style={styles.footerText}>© 2026 Misanthropic Codes. All rights reserved.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  version: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: Spacing.xs,
  },
  card: {
    marginBottom: Spacing.lg,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  bulletText: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
