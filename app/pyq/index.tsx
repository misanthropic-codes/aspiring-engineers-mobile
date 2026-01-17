import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { mockPyqPapers, mockSubjectWisePapers } from '../../src/mocks/mockData';

export default function PyqScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const handleOpenPdf = (url: string, title: string) => {
    router.push({
        pathname: '/pyq/viewer',
        params: { url, title }
    });
  };

  const renderSectionHeader = (title: string, subtitle: string) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderPyqCard = (item: typeof mockPyqPapers[0]) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleOpenPdf(item.pdfUrl, item.title)}
        activeOpacity={0.7}
    >
        <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={24} color={BrandColors.primary} />
            </View>
            <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    {item.badge && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.metaContainer}>
                    {item.metadata.map((meta, idx) => (
                        <View key={idx} style={styles.metaItem}>
                            <Text style={styles.metaLabel}>{meta.label}:</Text>
                            <Text style={styles.metaValue}>{meta.value}</Text>
                            {idx < item.metadata.length - 1 && <View style={styles.metaDivider} />}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
            headerTitle: 'Previous Year Questions',
            headerLargeTitle: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderSectionHeader('Year-wise Question Papers', 'Practice with actual JEE Mains papers')}
        
        <View style={styles.grid}>
            {mockPyqPapers.map((paper, index) => (
                <View key={index} style={styles.gridItem}>
                    {renderPyqCard(paper)}
                </View>
            ))}
        </View>

        <View style={styles.divider} />

        {renderSectionHeader('Subject-wise Collections', 'Topic-wise detailed practice')}
        
        <View style={styles.grid}>
            {mockSubjectWisePapers.map((paper, index) => (
                <View key={index} style={styles.gridItem}>
                    <TouchableOpacity 
                        style={styles.subjectCard} 
                        onPress={() => handleOpenPdf(paper.pdfUrl, paper.title)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(37, 150, 190, 0.2)' : 'rgba(37, 150, 190, 0.1)' }]}>
                            <Ionicons name="download-outline" size={24} color={BrandColors.secondary} />
                        </View>
                        <View style={styles.cardInfo}>
                             <Text style={styles.cardTitle}>{paper.title}</Text>
                             <Text style={styles.cardDesc}>{paper.description}</Text>
                             {paper.badge && <Text style={styles.subjectBadge}>{paper.badge}</Text>}
                        </View>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.xl,
  },
  grid: {
    gap: Spacing.md,
  },
  gridItem: {
    // For now simple list, can be grid if needed
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: isDark ? 'rgba(96, 223, 255, 0.15)' : 'rgba(96, 223, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  subjectCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  subjectBadge: {
    fontSize: 11,
    color: BrandColors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
});
