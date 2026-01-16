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
    LightColors,
    Spacing,
} from '../../constants/theme';

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
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const showSecure = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : undefined,
            style,
          ].filter(Boolean)}
          placeholderTextColor={LightColors.textMuted}
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
              color={LightColors.textMuted}
            />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && hint && <Text style={styles.hint}>{hint}</Text>}
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
    color: LightColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LightColors.card,
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: {
    borderColor: BrandColors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: LightColors.error,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSizes.base,
    color: LightColors.textPrimary,
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
    color: LightColors.error,
    marginTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSizes.xs,
    color: LightColors.textMuted,
    marginTop: Spacing.xs,
  },
});

export default Input;
