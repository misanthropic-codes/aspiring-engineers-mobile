import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { QuestionStatus } from '../../types';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionStatus: Record<string, QuestionStatus>;
  questions: { id: string }[];
  onQuestionSelect: (index: number) => void;
  isVisible: boolean;
}

export const QuestionPalette = ({
  totalQuestions,
  currentQuestionIndex,
  questionStatus,
  questions,
  onQuestionSelect,
  isVisible,
}: QuestionPaletteProps) => {
  const { colors } = useTheme();

  if (!isVisible) return null;

  const getStatusColor = (status: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) return BrandColors.secondary; // Highlight current
    switch (status) {
      case QuestionStatus.ANSWERED:
        return colors.success;
      case QuestionStatus.MARKED_FOR_REVIEW:
        return colors.warning;
      case QuestionStatus.ANSWERED_AND_MARKED:
        return '#7C4DFF'; // Purple for answered & marked
      case QuestionStatus.NOT_ANSWERED:
        return colors.error;
      default:
        return colors.border; // Not visited
    }
  };

  const getStatusTextColor = (status: QuestionStatus, isCurrent: boolean) => {
      // If current or visited (non-border color), use white text
      // Otherwise use primary text
      if (isCurrent || status !== QuestionStatus.NOT_VISITED) return '#fff';
      return colors.textPrimary;
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Question Palette</Text>
      
      <View style={styles.legendContainer}>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
             <Text style={styles.legendText}>Answered</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
             <Text style={styles.legendText}>Not Answered</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
             <Text style={styles.legendText}>Marked</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
             <Text style={styles.legendText}>Not Visited</Text>
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {questions.map((q, index) => {
          const status = questionStatus[q.id] || QuestionStatus.NOT_VISITED;
          const isCurrent = index === currentQuestionIndex;
          const bgColor = getStatusColor(status, isCurrent);
          const textColor = getStatusTextColor(status, isCurrent);

          // For not visited, we need to ensure contrast if background is border color
          // If status is NOT_VISITED (border color), color depends on theme
          return (
            <TouchableOpacity
              key={q.id}
              style={[styles.item, { backgroundColor: bgColor }]}
              onPress={() => onQuestionSelect(index)}
            >
              <Text style={[styles.itemText, { color: textColor }]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    // Transparent on iOS to let GlassView show. Card color on Android.
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: Spacing.md,
    maxHeight: 300,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: FontSizes.xs,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  item: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
