/**
 * Help & Support Screen - Test Portal Mobile
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
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

export default function SupportScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const contactOptions = [
    {
      icon: 'mail-outline',
      label: 'Email Support',
      value: 'support@theaspiringengineers.com',
      onPress: () => Linking.openURL('mailto:support@theaspiringengineers.com'),
    },
    {
      icon: 'globe-outline',
      label: 'Visit Website',
      value: 'www.theaspiringengineers.com',
      onPress: () => Linking.openURL('https://www.theaspiringengineers.com'),
    },
  ];

  const faqs = [
    {
      q: 'How to purchase a test package?',
      a: 'Go to the Store tab, select a package, and follow the payment instructions.',
    },
    {
      q: 'Where can I see my test results?',
      a: 'Go to the Analytics tab or click on any completed test in your history.',
    },
    {
      q: 'Can I take tests offline?',
      a: 'Currently, an active internet connection is required to take tests and save progress.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Contact Us</Text>
        <View style={styles.contactGrid}>
          {contactOptions.map((option) => (
            <TouchableOpacity key={option.label} onPress={option.onPress} style={styles.contactItem}>
              <Card style={styles.contactCard}>
                <Ionicons name={option.icon as any} size={24} color={BrandColors.primary} />
                <Text style={styles.contactLabel}>{option.label}</Text>
                <Text style={styles.contactValue}>{option.value}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <Card key={index} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </Card>
          ))}
        </View>
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
  contactGrid: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  contactItem: {
    width: '100%',
  },
  contactCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: colors.card,
  },
  contactLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: Spacing.sm,
  },
  contactValue: {
    fontSize: FontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  faqList: {
    gap: Spacing.md,
  },
  faqCard: {
    backgroundColor: colors.card,
  },
  faqQuestion: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  faqAnswer: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
