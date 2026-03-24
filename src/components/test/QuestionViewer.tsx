import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Answer, Question, QuestionType } from '../../types';
import { HtmlText } from '../common/HtmlText';
import { MathRenderer } from '../common/MathRenderer';
import { hasLatex } from '../../utils/latex.utils';
import { resolveImageUrl } from '../../utils/url.utils';
import { ImagePreviewModal } from '../common/ImagePreviewModal';

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
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
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

  const handleOptionSelect = (optionLetter: string) => {
    if (question.type === QuestionType.MCQ_SINGLE) {
      onAnswerChange({ selectedOptions: [optionLetter] });
    } else if (question.type === QuestionType.MCQ_MULTIPLE) {
      const currentSelected = answer?.selectedOptions || [];
      const newSelected = currentSelected.includes(optionLetter)
        ? currentSelected.filter(letter => letter !== optionLetter)
        : [...currentSelected, optionLetter];
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

    return question.options.map((optionRaw, index) => {
      // Ensure optionRaw is treated as a string even if normalization missed it
      const optionText = typeof optionRaw === 'string' 
        ? optionRaw 
        : (optionRaw && typeof optionRaw === 'object' && (optionRaw as any).text) 
          ? (optionRaw as any).text 
          : String(optionRaw || '');

      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
      const isSelected = answer?.selectedOptions?.includes(optionLetter);

      return (
        <TouchableOpacity
          key={`${question.id}-opt-${index}`}
          style={[
            styles.optionCard,
            isSelected && styles.optionCardSelected,
          ]}
          onPress={() => handleOptionSelect(optionLetter)}
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
                 <Text style={styles.optionLabel}>{optionLetter}</Text>
             )}
          </View>
          {hasLatex(optionText) ? (
            <MathRenderer 
              content={optionText} 
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}
              baseSize={FontSizes.sm}
            />
          ) : (
            <HtmlText 
              html={optionText || `Option ${optionLetter}`} 
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]} 
              baseSize={FontSizes.sm} 
            />
          )}
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

  console.log('QuestionViewer rendering:', {
    id: question.id,
    type: question.type,
    optionsCount: question.options?.length,
    hasImage: !!((question as any).questionImage || (question as any).questionImageUrl),
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.qNum}>Question {question.questionNumber}</Text>
        <View style={styles.marksContainer}>
          <Text style={styles.marksText}>{question.marks > 0 ? '+' : ''}{question.marks}</Text>
          <Text style={styles.negativeText}>-{question.negativeMarks}</Text>
        </View>
      </View>

        <MathRenderer 
          content={question.questionText} 
          style={styles.questionText} 
          baseSize={FontSizes.base} 
        />
      
      {/* Question Images */}
      {(() => {
        const imageUrl = resolveImageUrl((question as any).questionImage || (question as any).questionImageUrl);
        const images = (question as any).images || [];
        
        return (
          <View style={styles.imageContainer}>
            {imageUrl && (
              <TouchableOpacity onPress={() => setPreviewImage(imageUrl)} activeOpacity={0.9}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.questionImage} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {Array.isArray(images) && images.map((img: string, idx: number) => {
              const resUrl = resolveImageUrl(img);
              if (!resUrl) return null;
              return (
                <TouchableOpacity key={`q-img-wrap-${idx}`} onPress={() => setPreviewImage(resUrl)} activeOpacity={0.9}>
                  <Image 
                    key={`q-img-${idx}`}
                    source={{ uri: resUrl }} 
                    style={styles.questionImage} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })()}

      <ImagePreviewModal 
        isVisible={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      <View style={styles.answerArea}>
        {/* Render options if they exist, regardless of type as a fallback, 
            but prioritize MCQ types for standard behavior */}
        {(question.options && question.options.length > 0) ? renderOptions() : null}
        
        {(question.type === QuestionType.NUMERICAL || question.type === QuestionType.INTEGER) && 
         (!question.options || question.options.length === 0) && 
         renderNumericalInput()}
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
    marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
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
    backgroundColor: colors.background,
  },
});
