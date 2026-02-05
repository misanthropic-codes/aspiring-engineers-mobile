/**
 * Counselling Sessions Screen - Aspiring Engineers Mobile
 * 
 * Displays user's counselling sessions with upcoming/past tabs,
 * cancel functionality, and review submission for completed sessions.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    RefreshControl,
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
import { CounsellingSession, SessionStatus } from '../../src/types/counselling';

type TabType = 'upcoming' | 'past';

export default function CounsellingSessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabType>('upcoming');
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [reviewCounsellorId, setReviewCounsellorId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSessions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await counsellingService.getMySessions();
      // Sort by scheduledDate or preferredDate (newest first)
      setSessions(
        data.sort((a, b) => {
          const dateA = new Date(a.scheduledDate || a.preferredDate).getTime();
          const dateB = new Date(b.scheduledDate || b.preferredDate).getTime();
          return dateB - dateA;
        })
      );
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancelSession = (sessionId: string) => {
    Alert.prompt(
      'Cancel Session',
      'Please provide a reason for cancellation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert('Error', 'Please provide a reason');
              return;
            }
            try {
              setCancelling(sessionId);
              await counsellingService.cancelSession(sessionId, reason);
              await fetchSessions();
              Alert.alert('Success', 'Session cancelled successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel session');
            } finally {
              setCancelling(null);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const openReviewModal = (sessionId: string, counsellorId: string) => {
    setReviewSessionId(sessionId);
    setReviewCounsellorId(counsellorId);
    setRating(0);
    setReviewText('');
    setIsReviewOpen(true);
  };

  const submitReview = async () => {
    if (!reviewSessionId || !reviewCounsellorId) return;

    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      await counsellingService.submitReview({
        sessionId: reviewSessionId,
        counsellorId: reviewCounsellorId,
        rating,
        review: reviewText,
      });
      Alert.alert('Success', 'Review submitted successfully!');
      setIsReviewOpen(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    const statusConfig: Record<SessionStatus, { bg: string; text: string; label: string }> = {
      confirmed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: 'Confirmed' },
      scheduled: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: 'Scheduled' },
      completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label: 'Completed' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: 'Cancelled' },
      pending_assignment: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label: 'Pending' },
      'no-show': { bg: 'rgba(107, 114, 128, 0.15)', text: '#6B7280', label: 'No Show' },
    };
    return statusConfig[status] || statusConfig.pending_assignment;
  };

  const getCounsellorName = (session: CounsellingSession) => {
    if (session.counsellor) return session.counsellor.name;
    if (session.counsellorId && typeof session.counsellorId === 'object') {
      return session.counsellorId.name;
    }
    return 'Pending Assignment';
  };

  const getCounsellorId = (session: CounsellingSession): string | null => {
    if (session.counsellor) return session.counsellor._id;
    if (session.counsellorId && typeof session.counsellorId === 'object') {
      return session.counsellorId._id;
    }
    if (typeof session.counsellorId === 'string') return session.counsellorId;
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const isPast = ['completed', 'cancelled', 'no-show'].includes(session.status);
    const isUpcoming = ['pending_assignment', 'scheduled', 'confirmed'].includes(session.status);

    if (selectedTab === 'past') return isPast;
    return isUpcoming;
  });

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchSessions()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'upcoming' && styles.activeTab,
            selectedTab === 'upcoming' && { borderBottomColor: BrandColors.primary },
          ]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'upcoming' ? BrandColors.primary : colors.textMuted },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'past' && styles.activeTab,
            selectedTab === 'past' && { borderBottomColor: BrandColors.primary },
          ]}
          onPress={() => setSelectedTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === 'past' ? BrandColors.primary : colors.textMuted },
            ]}
          >
            Past Sessions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchSessions(true)}
            tintColor={BrandColors.primary}
          />
        }
      >
        {/* Book New Session Button */}
        <TouchableOpacity
          style={styles.bookNewButton}
          onPress={() => router.push('/counselling')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.bookNewButtonText}>Book New Session</Text>
        </TouchableOpacity>

        {/* Empty State */}
        {filteredSessions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No {selectedTab} sessions found
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {selectedTab === 'upcoming'
                ? "You don't have any sessions scheduled. Book a session to get started."
                : "You haven't completed any sessions yet."}
            </Text>
          </View>
        ) : (
          /* Sessions List */
          <View style={styles.sessionsList}>
            {filteredSessions.map((session) => {
              const statusBadge = getStatusBadge(session.status);
              const counsellorId = getCounsellorId(session);

              return (
                <View key={session._id} style={[styles.sessionCard, { backgroundColor: colors.card }]}>
                  {/* Header */}
                  <View style={[styles.cardHeader, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }]}>
                    <View style={styles.cardHeaderContent}>
                      <View style={styles.agendaRow}>
                        <Ionicons
                          name={session.status === 'confirmed' ? 'videocam' : 'time'}
                          size={16}
                          color={BrandColors.primary}
                        />
                        <Text style={[styles.agendaText, { color: colors.textPrimary }]} numberOfLines={1}>
                          {session.agenda || 'Counselling Session'}
                        </Text>
                      </View>
                      <Text style={[styles.dateText, { color: colors.textMuted }]}>
                        {formatDate(session.scheduledDate || session.preferredDate)} • {session.preferredTimeSlot}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
                      <Text style={[styles.statusText, { color: statusBadge.text }]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Body */}
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Counsellor</Text>
                        <View style={styles.counsellorRow}>
                          <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                            {getCounsellorName(session)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Platform</Text>
                        <View style={styles.counsellorRow}>
                          <Ionicons name="link-outline" size={14} color={colors.textMuted} />
                          <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                            {session.meetingPreference === 'google_meet' ? 'Google Meet' : 'Zoom'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Footer Actions */}
                  <View style={[styles.cardFooter, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA' }]}>
                    {session.status === 'pending_assignment' && (
                      <Text style={[styles.pendingText, { color: colors.textMuted }]}>
                        Waiting for counsellor assignment...
                      </Text>
                    )}

                    <View style={styles.actionButtons}>
                      {session.meetingLink && session.status === 'confirmed' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.joinBtn]}
                          onPress={() => Linking.openURL(session.meetingLink!)}
                        >
                          <Ionicons name="videocam" size={16} color="#FFF" />
                          <Text style={styles.joinBtnText}>Join Meeting</Text>
                        </TouchableOpacity>
                      )}

                      {session.status === 'completed' && counsellorId && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
                          onPress={() => openReviewModal(session._id, counsellorId)}
                        >
                          <Ionicons name="star-outline" size={16} color={colors.textPrimary} />
                          <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>
                            Rate Session
                          </Text>
                        </TouchableOpacity>
                      )}

                      {(session.status === 'scheduled' || session.status === 'pending_assignment') && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => handleCancelSession(session._id)}
                          disabled={cancelling === session._id}
                        >
                          {cancelling === session._id ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                          ) : (
                            <>
                              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                              <Text style={styles.cancelBtnText}>Cancel</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={isReviewOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Rate your session</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                How was your experience with the counsellor?
              </Text>
            </View>

            <View style={styles.modalBody}>
              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                    <Ionicons
                      name={rating >= star ? 'star' : 'star-outline'}
                      size={36}
                      color={rating >= star ? '#FBBF24' : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Review Text */}
              <TextInput
                style={[
                  styles.reviewInput,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB',
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Share your feedback..."
                placeholderTextColor={colors.textMuted}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.modalFooter, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA' }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}
                onPress={() => setIsReviewOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn, rating === 0 && styles.disabledBtn]}
                onPress={submitReview}
                disabled={submittingReview || rating === 0}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSizes.base,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  bookNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: BrandColors.primary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  bookNewButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  sessionsList: {
    gap: Spacing.md,
  },
  sessionCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  cardHeaderContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  agendaText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    flex: 1,
  },
  dateText: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  cardBody: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  counsellorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  cardFooter: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  pendingText: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  joinBtn: {
    backgroundColor: BrandColors.primary,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  starBtn: {
    padding: Spacing.xs,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: FontSizes.base,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  submitBtn: {
    backgroundColor: BrandColors.primary,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
