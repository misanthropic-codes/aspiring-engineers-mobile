/**
 * Forgot Password Screen - Test Portal Mobile
 * 
 * Allows users to request a password reset link.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/ui';
import { API_CONFIG } from '../../src/config/api.config';
import {
    BorderRadius,
    BrandColors,
    FontSizes,
    LightColors,
    Spacing,
} from '../../src/constants/theme';
import { mockAuthService } from '../../src/mocks';
import { isValidEmail } from '../../src/utils/validators';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    setError('');
    setSuccess('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      if (API_CONFIG.USE_MOCK) {
        const response = await mockAuthService.forgotPassword(email);
        setSuccess(response.message);
      } else {
        // TODO: Implement real API call
        setSuccess('Password reset link sent to ' + email);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={LightColors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-open-outline"
                size={48}
                color={BrandColors.primary}
              />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={LightColors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color={LightColors.success} />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={LightColors.textMuted}
                />
              }
            />

            <Button
              onPress={handleResetRequest}
              loading={loading}
              fullWidth
              size="lg"
              disabled={!!success}
            >
              {success ? 'Email Sent!' : 'Send Reset Link'}
            </Button>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={16} color={BrandColors.primary} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    alignSelf: 'center',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: LightColors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LightColors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: LightColors.error,
    fontSize: FontSizes.sm,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${LightColors.success}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    color: LightColors.success,
    fontSize: FontSizes.sm,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  backToLoginText: {
    fontSize: FontSizes.sm,
    color: BrandColors.primary,
    fontWeight: '500',
  },
});
