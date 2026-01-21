import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Package, packagesService } from '../../src/services/packages.service';

export default function StoreScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [packages, setPackages] = React.useState<Package[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await packagesService.getPackages();
        setPackages(response.data);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuyNow = (link: string | undefined) => {
    if (!link) return;
    Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
  };

  const renderStoreItem = (item: Package) => (
    <TouchableOpacity 
      key={item._id} 
      style={styles.card}
      onPress={() => item.thumbnail && handleBuyNow(item.thumbnail)} // Placeholder for purchase link
      activeOpacity={0.9}
    >
      {item.thumbnail && <Image source={{ uri: item.thumbnail }} style={styles.cardImage} />}
      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceContainer}>
           <View>
              <Text style={styles.currentPrice}>₹{item.discountPrice || item.price}</Text>
              {item.discountPrice && <Text style={styles.originalPrice}>₹{item.price}</Text>}
           </View>
           <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handleBuyNow(item.thumbnail)}
           >
              <Text style={styles.buyButtonText}>Buy Now</Text>
           </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       <View style={styles.header}>
        <Text style={styles.headerTitle}>Store</Text>
        <Text style={styles.headerSubtitle}>Premium Resources for You</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Categories / Filter could go here */}
        
        <View style={styles.grid}>
          {loading ? (
            <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 40 }} />
          ) : packages.length > 0 ? (
            packages.map(renderStoreItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Packages Available</Text>
              <Text style={styles.emptySubtext}>Check back later for new courses and test series.</Text>
            </View>
          )}
        </View>

        <View style={styles.supportCard}>
             <Ionicons name="headset" size={32} color={BrandColors.primary} />
             <View style={styles.supportInfo}>
                 <Text style={styles.supportTitle}>Need Help?</Text>
                 <Text style={styles.supportDesc}>Contact our support team for any queries regarding purchases.</Text>
             </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  grid: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: Spacing.md,
  },
  categoryBadge: {
    position: 'absolute',
    top: -165,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  currentPrice: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  originalPrice: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  buyButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(37, 150, 190, 0.1)' : 'rgba(37, 150, 190, 0.05)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  supportDesc: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
});
