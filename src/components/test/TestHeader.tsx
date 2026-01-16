import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, FontSizes, LightColors, Spacing } from '../../constants/theme';
import { formatTimerDisplay } from '../../utils/formatters';

interface TestHeaderProps {
  testTitle: string;
  timeRemaining: number;
  onSubmit: () => void;
  onTogglePalette: () => void;
  showPalette: boolean;
}

export const TestHeader = ({
  testTitle,
  timeRemaining,
  onSubmit,
  onTogglePalette,
  showPalette,
}: TestHeaderProps) => {
  const handleSubmitPress = () => {
    Alert.alert(
      'Submit Test',
      'Are you sure you want to submit the test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: onSubmit },
      ]
    );
  };

  // Warning color when time is low (< 5 mins)
  const timerColor = timeRemaining < 300 ? LightColors.error : LightColors.textPrimary;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{testTitle}</Text>
        <TouchableOpacity onPress={handleSubmitPress} style={styles.submitButton}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>
            {formatTimerDisplay(timeRemaining)}
          </Text>
        </View>

        <TouchableOpacity onPress={onTogglePalette} style={styles.paletteButton}>
          <Ionicons 
            name={showPalette ? "grid" : "grid-outline"} 
            size={20} 
            color={BrandColors.primary} 
          />
          <Text style={styles.paletteText}>
            {showPalette ? 'Hide Questions' : 'Question Palette'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LightColors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: LightColors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: LightColors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  submitButton: {
    backgroundColor: LightColors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  submitText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LightColors.backgroundAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  timerText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  paletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paletteText: {
    fontSize: FontSizes.sm,
    color: BrandColors.primary,
    fontWeight: '500',
  },
});
