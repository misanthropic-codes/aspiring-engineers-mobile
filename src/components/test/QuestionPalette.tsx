import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, FontSizes, LightColors, Spacing } from '../../constants/theme';
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
  if (!isVisible) return null;

  const getStatusColor = (status: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) return BrandColors.secondary; // Highlight current
    switch (status) {
      case QuestionStatus.ANSWERED:
        return LightColors.success;
      case QuestionStatus.MARKED_FOR_REVIEW:
        return LightColors.warning;
      case QuestionStatus.ANSWERED_AND_MARKED:
        return '#7C4DFF'; // Purple for answered & marked
      case QuestionStatus.NOT_ANSWERED:
        return LightColors.error;
      default:
        return LightColors.border; // Not visited
    }
  };

  const getStatusTextColor = (status: QuestionStatus, isCurrent: boolean) => {
      if (isCurrent || status !== QuestionStatus.NOT_VISITED) return '#fff';
      return LightColors.textPrimary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Question Palette</Text>
      
      <View style={styles.legendContainer}>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: LightColors.success }]} />
             <Text style={styles.legendText}>Answered</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: LightColors.error }]} />
             <Text style={styles.legendText}>Not Answered</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: LightColors.warning }]} />
             <Text style={styles.legendText}>Marked</Text>
         </View>
         <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: LightColors.border }]} />
             <Text style={styles.legendText}>Not Visited</Text>
         </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {questions.map((q, index) => {
          const status = questionStatus[q.id] || QuestionStatus.NOT_VISITED;
          const isCurrent = index === currentQuestionIndex;
          const bgColor = getStatusColor(status, isCurrent);
          const textColor = getStatusTextColor(status, isCurrent);

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: LightColors.background,
    borderTopWidth: 1,
    borderTopColor: LightColors.border,
    padding: Spacing.md,
    maxHeight: 300,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: LightColors.textPrimary,
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
    color: LightColors.textSecondary,
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
