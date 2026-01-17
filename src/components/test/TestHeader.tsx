import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTimerDisplay } from '../../utils/formatters';
import { GlassView } from '../ui/GlassView';

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
  const { colors, isDark } = useTheme();
  
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
  const timerColor = timeRemaining < 300 ? colors.error : colors.textPrimary;

  const styles = getStyles(colors, isDark);

  return (
    <GlassView style={styles.container} intensity={90}>
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
    </GlassView>
  );
};

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    // On iOS, GlassView handles background. On Android, GlassView falls back to this or we set it explicitly there.
    // However, GlassView logic sets bg for non-iOS. 
    // For iOS, we want transparent here so blur shows through.
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10, // Ensure header is above content
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
    color: colors.textPrimary, // Dynamic text
    flex: 1,
    marginRight: Spacing.md,
  },
  submitButton: {
    backgroundColor: colors.error, // Dynamic error color
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
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', // Semi-transparent for glass
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
