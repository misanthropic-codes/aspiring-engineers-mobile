/**
 * Card Component - Test Portal Mobile
 * 
 * Container component with consistent styling for content sections.
 */

import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { BorderRadius, LightColors, Shadows, Spacing } from '../../constants/theme';

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
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
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

import { Text, TextProps } from 'react-native';

interface CardTitleProps extends TextProps {
  children: React.ReactNode;
}

export function CardTitle({ children, style, ...props }: CardTitleProps) {
  return (
    <Text style={[styles.title, style]} {...props}>
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
  return (
    <Text style={[styles.description, style]} {...props}>
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
    backgroundColor: LightColors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: LightColors.border,
    overflow: 'hidden',
  },
  elevated: {
    borderWidth: 0,
    ...Shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: LightColors.border,
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
    color: LightColors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: LightColors.textMuted,
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
