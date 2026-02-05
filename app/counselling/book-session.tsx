/**
 * Book Session Screen - Aspiring Engineers Mobile
 * 
 * Form to book a new counselling session with date, time, and agenda selection.
 */

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, BrandColors, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import counsellingService from '../../src/services/counselling.service';
import { BookSessionPayload, CounsellingEnrollment, TIME_SLOTS } from '../../src/types/counselling';

export default function BookSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ enrollmentId: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [enrollment, setEnrollment] = useState<CounsellingEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [preferredDate, setPreferredDate] = useState<Date>(new Date());
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingPreference, setMeetingPreference] = useState<'google_meet' | 'zoom'>('google_meet');

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchEnrollment();
  }, [params.enrollmentId]);

  const fetchEnrollment = async () => {
    if (!params.enrollmentId) {
      setError('No enrollment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const enrollments = await counsellingService.getMyEnrollments();
      const found = enrollments.find((e) => e._id === params.enrollmentId);

      if (!found) {
        setError('Enrollment not found');
      } else if (found.status !== 'active') {
        setError('This enrollment is not active');
      } else if (found.sessionsRemaining <= 0) {
        setError('No sessions remaining in this enrollment');
      } else {
        setEnrollment(found);
        // Set initial date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPreferredDate(tomorrow);
      }
    } catch (err: any) {
      console.error('Failed to fetch enrollment:', err);
      setError(err.message || 'Failed to load enrollment details');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getMaxDate = () => {
    const maxDays = new Date();
    maxDays.setDate(maxDays.getDate() + 30);

    if (enrollment) {
      const expiryDate = new Date(enrollment.expiresAt);
      return expiryDate < maxDays ? expiryDate : maxDays;
    }

    return maxDays;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPreferredDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!params.enrollmentId) return;

    // Validation
    if (!preferredTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }
    if (!agenda.trim()) {
      Alert.alert('Error', 'Please provide an agenda');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: BookSessionPayload = {
        enrollmentId: params.enrollmentId,
        preferredDate: preferredDate.toISOString().split('T')[0],
        preferredTimeSlot,
        agenda: agenda.trim(),
        meetingPreference,
      };

      await counsellingService.bookSession(payload);
      setSuccess(true);

      setTimeout(() => {
        router.replace('/counselling/sessions' as any);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to book session:', err);
      Alert.alert('Error', err.message || 'Failed to book session');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (error && !enrollment) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
          <View style={[styles.errorIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Unable to Book Session
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textMuted }]}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.backButtonText}>Back to Enrollments</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.successCard, { backgroundColor: colors.card }]}>
          <View style={[styles.successIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
            Session Booked Successfully!
          </Text>
          <Text style={[styles.successMessage, { color: colors.textMuted }]}>
            Your session request has been submitted. Our team will review and confirm your booking soon.
          </Text>
          <Text style={[styles.redirectText, { color: colors.textMuted }]}>
            Redirecting to sessions page...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Package Details Card */}
        {enrollment && (
          <View style={[styles.packageCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.packageCardTitle, { color: colors.textMuted }]}>
              Package Details
            </Text>
            <Text style={[styles.packageName, { color: colors.textPrimary }]}>
              {enrollment.packageSnapshot.name}
            </Text>
            <View style={styles.sessionStats}>
              <View style={styles.sessionStatItem}>
                <Text style={[styles.sessionStatValue, { color: '#10B981' }]}>
                  {enrollment.sessionsRemaining}
                </Text>
                <Text style={[styles.sessionStatLabel, { color: colors.textMuted }]}>
                  Remaining
                </Text>
              </View>
              <View style={[styles.sessionStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.sessionStatItem}>
                <Text style={[styles.sessionStatValue, { color: colors.textPrimary }]}>
                  {enrollment.packageSnapshot.maxSessions}
                </Text>
                <Text style={[styles.sessionStatLabel, { color: colors.textMuted }]}>Total</Text>
              </View>
            </View>
            <View style={styles.expiryRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.expiryText, { color: colors.textMuted }]}>
                Expires: {new Date(enrollment.expiresAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Booking Form */}
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          {/* Date Picker */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar" size={16} color={BrandColors.primary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Preferred Date *
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB', borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, { color: colors.textPrimary }]}>
                {formatDate(preferredDate)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              Select a date between tomorrow and the next 30 days
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={preferredDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={getMinDate()}
              maximumDate={getMaxDate()}
              onChange={handleDateChange}
            />
          )}

          {/* Time Slot */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="time" size={16} color={BrandColors.primary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Preferred Time Slot *
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeSlotsScroll}
              contentContainerStyle={styles.timeSlotsContainer}
            >
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlot,
                    {
                      backgroundColor: preferredTimeSlot === slot
                        ? BrandColors.primary
                        : isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                      borderColor: preferredTimeSlot === slot
                        ? BrandColors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => setPreferredTimeSlot(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      { color: preferredTimeSlot === slot ? '#FFF' : colors.textPrimary },
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Agenda */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text" size={16} color={BrandColors.primary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Agenda / Topics to Discuss *
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g., College selection, choice filling strategy, career guidance..."
              placeholderTextColor={colors.textMuted}
              value={agenda}
              onChangeText={setAgenda}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              Please describe what you'd like to discuss in the session
            </Text>
          </View>

          {/* Meeting Preference */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="videocam" size={16} color={BrandColors.primary} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>
                Meeting Platform *
              </Text>
            </View>
            <View style={styles.platformButtons}>
              <TouchableOpacity
                style={[
                  styles.platformButton,
                  {
                    backgroundColor: meetingPreference === 'google_meet'
                      ? `${BrandColors.primary}15`
                      : isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    borderColor: meetingPreference === 'google_meet'
                      ? BrandColors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => setMeetingPreference('google_meet')}
              >
                <Text
                  style={[
                    styles.platformButtonText,
                    { color: meetingPreference === 'google_meet' ? BrandColors.primary : colors.textPrimary },
                  ]}
                >
                  Google Meet
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.platformButton,
                  {
                    backgroundColor: meetingPreference === 'zoom'
                      ? `${BrandColors.primary}15`
                      : isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    borderColor: meetingPreference === 'zoom'
                      ? BrandColors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => setMeetingPreference('zoom')}
              >
                <Text
                  style={[
                    styles.platformButtonText,
                    { color: meetingPreference === 'zoom' ? BrandColors.primary : colors.textPrimary },
                  ]}
                >
                  Zoom
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Book Session</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  // Error Card
  errorCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  // Success Card
  successCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  redirectText: {
    fontSize: FontSizes.sm,
  },
  // Package Card
  packageCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  packageCardTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  packageName: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sessionStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  sessionStatLabel: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  sessionStatDivider: {
    width: 1,
    height: 40,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  expiryText: {
    fontSize: FontSizes.sm,
  },
  // Form Card
  formCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
  helperText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  timeSlotsScroll: {
    marginHorizontal: -Spacing.md,
  },
  timeSlotsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  timeSlot: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: FontSizes.base,
  },
  platformButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  platformButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  platformButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
