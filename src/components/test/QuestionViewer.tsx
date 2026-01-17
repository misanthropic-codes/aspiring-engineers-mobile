import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors, isDark } = useTheme();
  
  // Local state for numerical input to handle decimals and negative signs
  const [numericalValue, setNumericalValue] = React.useState('');
  const lastQuestionId = React.useRef(question.id);

  // Sync local numerical value when question changes or answer updates externally
  React.useEffect(() => {
    // If question changed, blindly reset
    if (lastQuestionId.current !== question.id) {
      setNumericalValue(answer?.numericalAnswer !== undefined ? String(answer.numericalAnswer) : '');
      lastQuestionId.current = question.id;
      return;
    }

    // Smart sync for same question
    const propVal = answer?.numericalAnswer;
    
    if (propVal === undefined) {
      // Only clear if we are not currently typing a negative sign or empty
      if (numericalValue !== '' && numericalValue !== '-') {
        setNumericalValue('');
      }
    } else {
      const currentParsed = parseFloat(numericalValue);
      // If props match what we have parsed locally, don't touch local state
      // This preserves "3." when prop is 3
      if (currentParsed !== propVal) {
        setNumericalValue(String(propVal));
      }
    }
  }, [question.id, answer?.numericalAnswer, numericalValue]);

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
    setNumericalValue(text);
    
    if (text === '' || text === '-') {
       onAnswerChange({ numericalAnswer: undefined });
       return;
    }

    const num = parseFloat(text);
    if (!isNaN(num)) {
       onAnswerChange({ numericalAnswer: num });
    }
  };

  const styles = getStyles(colors, isDark);

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
    return (
      <View style={styles.numericalContainer}>
        <Text style={styles.numericalLabel}>Enter your answer:</Text>
        <TextInput
          style={styles.numericalInput}
          keyboardType="numeric"
          placeholder="0.00"
          value={numericalValue}
          onChangeText={handleNumericalChange}
          placeholderTextColor={colors.textMuted}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.qNum}>Question {question.questionNumber}</Text>
        <View style={styles.marksContainer}>
          <Text style={styles.marksText}>{question.marks > 0 ? '+' : ''}{question.marks}</Text>
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

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderBottomColor: colors.border,
    paddingBottom: Spacing.xs,
  },
  qNum: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  marksContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  marksText: {
    fontSize: FontSizes.xs,
    color: colors.success,
    fontWeight: '600',
  },
  negativeText: {
    fontSize: FontSizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  questionText: {
    fontSize: FontSizes.base,
    color: colors.textPrimary,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  optionCardSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: isDark ? `${BrandColors.primary}15` : `${BrandColors.primary}05`, // More visible tint in dark mode
  },
  optionMarker: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    color: colors.textMuted,
  },
  optionText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  numericalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    backgroundColor: colors.input,
  },
});
