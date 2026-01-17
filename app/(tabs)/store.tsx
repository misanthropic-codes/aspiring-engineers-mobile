import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, BrandColors, ColorScheme, FontSizes, Spacing } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { mockStoreItems } from '../../src/mocks/mockData';

export default function StoreScreen() {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const handleBuyNow = (link: string) => {
    Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
  };

  const renderStoreItem = (item: typeof mockStoreItems[0]) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.card}
      onPress={() => handleBuyNow(item.link)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceContainer}>
           <View>
              <Text style={styles.currentPrice}>₹{item.price}</Text>
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
           </View>
           <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handleBuyNow(item.link)}
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
          {mockStoreItems.map(renderStoreItem)}
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
});
