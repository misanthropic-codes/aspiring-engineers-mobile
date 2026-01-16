/**
 * Register Screen - Test Portal Mobile
 * 
 * User registration screen with form validation.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
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
import {
  BorderRadius,
  BrandColors,
  FontSizes,
  LightColors,
  Spacing,
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { ExamType } from '../../src/types';
import { isValidEmail, isValidPassword, isValidPhone } from '../../src/utils/validators';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError(
        'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: new Date().toISOString(), // TODO: Add date picker
        examTargets: [ExamType.JEE_MAIN], // TODO: Add exam selection
        targetYear: new Date().getFullYear() + 1,
      });

      // Show success and navigate to login
      console.log('Registration successful:', response);
      // TODO: Navigate to OTP verification screen
      router.push('/(auth)/login' as any);
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your exam preparation journey
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={LightColors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
              autoComplete="name"
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={LightColors.textMuted}
                />
              }
            />

            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
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

            <Input
              label="Phone Number"
              placeholder="9876543210"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              leftIcon={
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={LightColors.textMuted}
                />
              }
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              isPassword
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={LightColors.textMuted}
                />
              }
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              isPassword
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={LightColors.textMuted}
                />
              }
            />

            <Button
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            >
              Create Account
            </Button>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href={'/(auth)/login' as any} asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: LightColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: LightColors.textMuted,
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
  form: {
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
  },
  linkText: {
    fontSize: FontSizes.sm,
    color: BrandColors.primary,
    fontWeight: '600',
  },
});
