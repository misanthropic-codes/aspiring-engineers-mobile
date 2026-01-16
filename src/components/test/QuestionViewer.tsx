import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, FontSizes, LightColors, Spacing } from '../../constants/theme';
import { Answer, Question, QuestionType } from '../../types';

interface QuestionViewerProps {
  question: Question;
  answer?: Answer;
  onAnswerChange: (answer: Answer) => void;
}

export const QuestionViewer = ({
  question,
  answer,
  onAnswerChange,
}: QuestionViewerProps) => {
  
  const handleOptionSelect = (optionId: string) => {
    if (question.type === QuestionType.MCQ_SINGLE) {
      onAnswerChange({ selectedOptions: [optionId] });
    } else if (question.type === QuestionType.MCQ_MULTIPLE) {
      const currentSelected = answer?.selectedOptions || [];
      const newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter(id => id !== optionId)
        : [...currentSelected, optionId];
      onAnswerChange({ selectedOptions: newSelected });
    }
  };

  const handleNumericalChange = (text: string) => {
    // allow numerical input, maybe negative and decimal
    const num = parseFloat(text);
    if (!isNaN(num)) {
      onAnswerChange({ numericalAnswer: num });
    } else if (text === '' || text === '-') {
       // Allow clearing or starting with negative
       onAnswerChange({ numericalAnswer: undefined }); // or handle text state locally if needed for strict typing
    }
  };

  const renderOptions = () => {
    if (!question.options) return null;

    return question.options.map((option, index) => {
      const isSelected = answer?.selectedOptions?.includes(option.id);
      
      return (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionCard,
            isSelected && styles.optionCardSelected,
          ]}
          onPress={() => handleOptionSelect(option.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.optionMarker,
            isSelected && styles.optionMarkerSelected
          ]}>
             {isSelected && (
                 <View style={styles.optionDot} />
             )}
             {!isSelected && (
                 <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
             )}
          </View>
          <Text style={[
              styles.optionText,
              isSelected && styles.optionTextSelected
          ]}>
            {option.text}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderNumericalInput = () => {
    const val = answer?.numericalAnswer !== undefined ? String(answer.numericalAnswer) : '';
    
    return (
      <View style={styles.numericalContainer}>
        <Text style={styles.numericalLabel}>Enter your answer:</Text>
        <TextInput
          style={styles.numericalInput}
          keyboardType="numeric"
          placeholder="0.00"
          value={val}
          onChangeText={handleNumericalChange}
          placeholderTextColor={LightColors.textMuted}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.qNum}>Question {question.questionNumber}</Text>
        <View style={styles.marksContainer}>
          <Text style={styles.marksText}>+{question.marks}</Text>
          <Text style={styles.negativeText}>-{question.negativeMarks}</Text>
        </View>
      </View>

      <Text style={styles.questionText}>{question.questionText}</Text>
      
      {/* TODO: Render Images if any */}

      <View style={styles.answerArea}>
        {(question.type === QuestionType.MCQ_SINGLE || question.type === QuestionType.MCQ_MULTIPLE) && renderOptions()}
        {(question.type === QuestionType.NUMERICAL || question.type === QuestionType.INTEGER) && renderNumericalInput()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'], // Space for bottom bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: LightColors.border,
    paddingBottom: Spacing.xs,
  },
  qNum: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: LightColors.textPrimary,
  },
  marksContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  marksText: {
    fontSize: FontSizes.xs,
    color: LightColors.success,
    fontWeight: '600',
  },
  negativeText: {
    fontSize: FontSizes.xs,
    color: LightColors.error,
    fontWeight: '600',
  },
  questionText: {
    fontSize: FontSizes.base,
    color: LightColors.textPrimary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  answerArea: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: LightColors.background,
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  optionCardSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: `${BrandColors.primary}05`,
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: LightColors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightColors.background,
  },
  optionMarkerSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primary,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: LightColors.textMuted,
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: LightColors.textPrimary,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: BrandColors.primary,
    fontWeight: '500',
  },
  numericalContainer: {
    padding: Spacing.md,
  },
  numericalLabel: {
    fontSize: FontSizes.sm,
    color: LightColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  numericalInput: {
    borderWidth: 1,
    borderColor: LightColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: LightColors.textPrimary,
    backgroundColor: LightColors.background,
  },
});
