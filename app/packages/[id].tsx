import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Package, packagesService } from '../../src/services/packages.service';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [pkg, setPkg] = React.useState<Package | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const data = await packagesService.getPackageDetails(id as string);
        setPkg(data);
      } catch (err: any) {
        console.error('Error fetching package details:', err);
        setError(err.message || 'Failed to load package details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (error || !pkg) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Package not found'}</Text>
        <TouchableOpacity 
           style={styles.backButton}
           onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{pkg.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <Image
          source={{ uri: pkg.thumbnail || 'https://via.placeholder.com/600x300' }}
          style={styles.thumbnail}
        />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pkg.examTypes[0]}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>{pkg.type}</Text>
            </View>
          </View>

          <Text style={styles.title}>{pkg.title}</Text>
          <Text style={styles.description}>{pkg.description}</Text>

          {pkg.purchaseInfo?.isPurchased ? (
            <View style={styles.purchasedBanner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.purchasedText}>Purchased & Active</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.buyButton} onPress={() => router.push('/store')}>
              <Text style={styles.buyButtonText}>
                Buy Now — ₹{pkg.discountPrice || pkg.price}
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Tests</Text>
              <Text style={styles.statValue}>{pkg.totalTests || pkg.tests?.length || 0}</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statLabel}>Validity</Text>
              <Text style={styles.statValue}>{pkg.validityDays} Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Questions</Text>
              <Text style={styles.statValue}>{pkg.totalQuestions || 0}</Text>
            </View>
          </View>

          {/* Tests List */}
          <Text style={styles.sectionTitle}>Tests in this Package</Text>
          {pkg.tests && pkg.tests.length > 0 ? (
            pkg.tests.map((test, index) => (
              <TouchableOpacity
                key={test._id}
                style={styles.testCard}
                onPress={() => router.push(`/test/attempt/${test._id}`)}
              >
                <View style={styles.testNumber}>
                  <Text style={styles.testNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testTitle} numberOfLines={1}>{test.title}</Text>
                  <View style={styles.testMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>{test.duration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="medal-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.metaText}>{test.totalMarks} marks</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No tests available in this package yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: Spacing.lg,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    backgroundColor: BrandColors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BrandColors.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  buyButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  purchasedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  purchasedText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: FontSizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: Spacing.md,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.sm,
  },
  testNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  testNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  testMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
