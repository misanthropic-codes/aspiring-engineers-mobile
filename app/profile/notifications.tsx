/**
 * Notifications Settings Screen - Test Portal Mobile
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import {
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    testReminders: true,
    newPackages: true,
    marketing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Alert Preferences</Text>
        <Card style={styles.card}>
          <NotificationItem
            label="Push Notifications"
            value={settings.pushEnabled}
            onToggle={() => toggleSetting('pushEnabled')}
            colors={colors}
          />
          <NotificationItem
            label="Email Notifications"
            value={settings.emailEnabled}
            onToggle={() => toggleSetting('emailEnabled')}
            colors={colors}
            isLast
          />
        </Card>

        <Text style={styles.sectionHeader}>Activity Notifications</Text>
        <Card style={styles.card}>
          <NotificationItem
            label="Test Reminders"
            value={settings.testReminders}
            onToggle={() => toggleSetting('testReminders')}
            colors={colors}
          />
          <NotificationItem
            label="New Packages"
            value={settings.newPackages}
            onToggle={() => toggleSetting('newPackages')}
            colors={colors}
          />
          <NotificationItem
            label="Promotions & Offers"
            value={settings.marketing}
            onToggle={() => toggleSetting('marketing')}
            colors={colors}
            isLast
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({ label, value, onToggle, colors, isLast }: any) {
  return (
    <View style={[styles.item, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: BrandColors.primary }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
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
    padding: Spacing.md,
  },
  sectionHeader: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  itemLabel: {
    fontSize: FontSizes.base,
  },
});
