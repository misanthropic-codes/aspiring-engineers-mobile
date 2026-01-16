/**
 * Button Component - Test Portal Mobile
 * 
 * A customizable button component with multiple variants and sizes.
 */

import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { BorderRadius, BrandColors, FontSizes, LightColors, Spacing } from '../../constants/theme';

// ============================================
// Types
// ============================================

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ============================================
// Styles by Variant
// ============================================

const getVariantStyles = (
  variant: ButtonVariant,
  disabled: boolean
): { container: ViewStyle; text: TextStyle } => {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: LightColors.textMuted,
          opacity,
        },
        text: {
          color: '#FFFFFF',
        },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: BrandColors.primary,
          opacity,
        },
        text: {
          color: BrandColors.primary,
        },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          opacity,
        },
        text: {
          color: BrandColors.primary,
        },
      };
    case 'destructive':
      return {
        container: {
          backgroundColor: LightColors.error,
          opacity,
        },
        text: {
          color: '#FFFFFF',
        },
      };
    case 'default':
    default:
      return {
        container: {
          backgroundColor: BrandColors.primary,
          opacity,
        },
        text: {
          color: '#FFFFFF',
        },
      };
  }
};

// ============================================
// Styles by Size
// ============================================

const getSizeStyles = (
  size: ButtonSize
): { container: ViewStyle; text: TextStyle } => {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.md,
        },
        text: {
          fontSize: FontSizes.sm,
        },
      };
    case 'lg':
      return {
        container: {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          borderRadius: BorderRadius.lg,
        },
        text: {
          fontSize: FontSizes.lg,
        },
      };
    case 'md':
    default:
      return {
        container: {
          paddingVertical: Spacing.sm + 4,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.lg,
        },
        text: {
          fontSize: FontSizes.base,
        },
      };
  }
};

// ============================================
// Component
// ============================================

export function Button({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant, disabled || loading);
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
              leftIcon ? styles.textWithLeftIcon : undefined,
              rightIcon ? styles.textWithRightIcon : undefined,
            ].filter(Boolean)}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// Base Styles
// ============================================

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
  textWithLeftIcon: {
    marginLeft: Spacing.sm,
  },
  textWithRightIcon: {
    marginRight: Spacing.sm,
  },
});

export default Button;
