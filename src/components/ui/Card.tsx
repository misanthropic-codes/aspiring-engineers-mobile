/**
 * Card Component - Test Portal Mobile
 * 
 * Container component with consistent styling for content sections.
 */

import React from 'react';
import { StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================
// Card Container
// ============================================

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();
  
  // Dynamic styles based on theme
  const dynamicStyles = {
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      // For elevated cards in dark mode, we might want a lighter border or just rely on the background difference
      borderWidth: 1, 
    },
    elevated: {
      borderWidth: isDark ? 1 : 0, // Keep border in dark mode for definition, remove in light mode for shadow
      borderColor: colors.border,
      ...Shadows.md,
      shadowColor: isDark ? '#000' : '#000', // Shadows are less visible in dark mode
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    }
  };

  return (
    <View
      style={[
        styles.card,
        dynamicStyles.card,
        variant === 'elevated' && dynamicStyles.elevated,
        variant === 'outlined' && dynamicStyles.outlined,
        padding === 'none' && styles.paddingNone,
        padding === 'sm' && styles.paddingSm,
        padding === 'md' && styles.paddingMd,
        padding === 'lg' && styles.paddingLg,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// ============================================
// Card Header
// ============================================

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================
// Card Title
// ============================================

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
}

export function CardTitle({ children, style, ...props }: CardTitleProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.title, { color: colors.textPrimary }, style]} {...props}>
      {children}
    </Text>
  );
}

// ============================================
// Card Description
// ============================================

interface CardDescriptionProps extends TextProps {
  children: React.ReactNode;
}

export function CardDescription({
  children,
  style,
  ...props
}: CardDescriptionProps) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.description, { color: colors.textMuted }, style]} {...props}>
      {children}
    </Text>
  );
}

// ============================================
// Card Content
// ============================================

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

export function CardContent({ children, style, ...props }: CardContentProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================
// Card Footer
// ============================================

interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.sm,
  },
  paddingMd: {
    padding: Spacing.md,
  },
  paddingLg: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  content: {
    // Content has no default padding, inherits from Card
  },
  footer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Card;
