/**
 * Input Component - Test Portal Mobile
 * 
 * Styled TextInput with label and error states.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import {
    BorderRadius,
    BrandColors,
    FontSizes,
    Spacing,
} from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

// ============================================
// Types
// ============================================

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

// ============================================
// Component
// ============================================

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const showSecure = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          { 
              backgroundColor: colors.input, // Use theme input bg
              borderColor: colors.border,
          },
          isFocused && { borderColor: BrandColors.primary, borderWidth: 1.5 },
          hasError && { borderColor: colors.error },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary }, // Dynamic text color
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : undefined,
            style,
          ].filter(Boolean)}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={showSecure}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {!error && hint && <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSizes.base,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
    padding: Spacing.xs,
  },
  error: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});

export default Input;
