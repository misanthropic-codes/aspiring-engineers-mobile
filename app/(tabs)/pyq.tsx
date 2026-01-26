import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BorderRadius,
  BrandColors,
  ColorScheme,
  FontSizes,
  Spacing,
} from "../../src/constants/theme";
import { useTheme } from "../../src/contexts/ThemeContext";
import {
  Paper,
  PAPER_CATEGORIES,
  PaperCategory,
  papersService,
} from "../../src/services/papers.service";

type PaperMode = "with-solution" | "without-solution";

export default function PyqTabScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // State
  const [selectedCategory, setSelectedCategory] =
    useState<PaperCategory>("jee-main");
  const [paperMode, setPaperMode] = useState<PaperMode>("with-solution");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch papers based on mode and category
  const fetchPapers = useCallback(async () => {
    try {
      const fetchFn =
        paperMode === "with-solution"
          ? papersService.getPapersWithSolution
          : papersService.getPapersNoSolution;

      const data = await fetchFn(selectedCategory);
      setPapers(data);
    } catch (error) {
      console.error("Error fetching papers:", error);
      setPapers([]);
    }
  }, [selectedCategory, paperMode]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchPapers().finally(() => setLoading(false));
  }, [fetchPapers]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPapers();
    setRefreshing(false);
  }, [fetchPapers]);

  // Stats calculation
  const stats = papersService.getStats(papers);

  // Handle paper view
  const handleViewPaper = (paper: Paper) => {
    router.push({
      pathname: "/pyq/viewer",
      params: {
        url: paper.paperDriveLink,
        title: paper.title,
      },
    });
  };

  // Handle solution view
  const handleViewSolution = (paper: Paper) => {
    if (!paper.solutionDriveLink) return;
    router.push({
      pathname: "/pyq/viewer",
      params: {
        url: paper.solutionDriveLink,
        title: `${paper.title} - Solution`,
      },
    });
  };

  // Handle video solution
  const handleViewVideo = (paper: Paper) => {
    if (!paper.videoSolutionLink) return;
    Linking.openURL(paper.videoSolutionLink);
  };

  // Render category tab
  const renderCategoryTab = (category: (typeof PAPER_CATEGORIES)[0]) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          isSelected && styles.categoryTabActive,
          isSelected && { borderColor: category.color },
        ]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryTabText,
            isSelected && styles.categoryTabTextActive,
            isSelected && { color: category.color },
          ]}
        >
          {category.shortName}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render paper card
  const renderPaperCard = ({ item }: { item: Paper }) => {
    const categoryInfo = papersService.getCategoryInfo(item.category);

    return (
      <View style={styles.paperCard}>
        {/* Thumbnail */}
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="document-text" size={32} color={colors.textMuted} />
          </View>
        )}

        {/* Content */}
        <View style={styles.paperContent}>
          <View style={styles.paperHeader}>
            <Text style={styles.paperTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View
              style={[
                styles.yearBadge,
                { backgroundColor: categoryInfo?.color || BrandColors.primary },
              ]}
            >
              <Text style={styles.yearBadgeText}>{item.year}</Text>
            </View>
          </View>

          <View style={styles.paperMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="folder-outline"
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>
                {categoryInfo?.name || item.category}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons
                name="bookmark-outline"
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{item.type}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewPaper(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={BrandColors.primary}
              />
              <Text style={styles.actionButtonText}>View Paper</Text>
            </TouchableOpacity>

            {paperMode === "with-solution" && item.solutionDriveLink && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewSolution(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={BrandColors.secondary}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: BrandColors.secondary },
                  ]}
                >
                  Solution
                </Text>
              </TouchableOpacity>
            )}

            {paperMode === "with-solution" && item.videoSolutionLink && (
              <TouchableOpacity
                style={[styles.actionButton, styles.videoButton]}
                onPress={() => handleViewVideo(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={16}
                  color="#EF4444"
                />
                <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                  Video
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={colors.textMuted}
      />
      <Text style={styles.emptyTitle}>No Papers Found</Text>
      <Text style={styles.emptySubtext}>
        {paperMode === "with-solution"
          ? "No papers with solutions available for this category yet."
          : "No practice papers available for this category yet."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Previous Year Questions</Text>
      </View>

      {/* Header content - Mode toggle + Category tabs */}
      <View style={styles.headerContainer}>
        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeToggle,
              paperMode === "with-solution" && styles.modeToggleActive,
            ]}
            onPress={() => setPaperMode("with-solution")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={paperMode === "with-solution" ? "#fff" : colors.textMuted}
            />
            <Text
              style={[
                styles.modeToggleText,
                paperMode === "with-solution" && styles.modeToggleTextActive,
              ]}
            >
              With Solutions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggle,
              paperMode === "without-solution" && styles.modeToggleActive,
            ]}
            onPress={() => setPaperMode("without-solution")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="fitness"
              size={16}
              color={
                paperMode === "without-solution" ? "#fff" : colors.textMuted
              }
            />
            <Text
              style={[
                styles.modeToggleText,
                paperMode === "without-solution" && styles.modeToggleTextActive,
              ]}
            >
              Practice Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {PAPER_CATEGORIES.map(renderCategoryTab)}
        </ScrollView>

        {/* Stats */}
        {!loading && papers.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalPapers}</Text>
              <Text style={styles.statLabel}>Papers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.yearsRange}</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
            {paperMode === "with-solution" && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.withSolutions}</Text>
                  <Text style={styles.statLabel}>Solutions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.withVideo}</Text>
                  <Text style={styles.statLabel}>Videos</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Papers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.loadingText}>Loading papers...</Text>
        </View>
      ) : (
        <FlatList
          data={papers}
          renderItem={renderPaperCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BrandColors.primary}
              colors={[BrandColors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: FontSizes["2xl"],
      fontWeight: "bold",
      color: colors.textPrimary,
    },
    headerContainer: {
      backgroundColor: colors.background,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modeToggleContainer: {
      flexDirection: "row",
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
    },
    modeToggle: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    modeToggleActive: {
      backgroundColor: BrandColors.primary,
      borderColor: BrandColors.primary,
    },
    modeToggleText: {
      fontSize: FontSizes.sm,
      fontWeight: "500",
      color: colors.textMuted,
    },
    modeToggleTextActive: {
      color: "#fff",
    },
    categoryTabs: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      gap: Spacing.sm,
    },
    categoryTab: {
      paddingVertical: Spacing.xs + 2,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    categoryTabActive: {
      backgroundColor: isDark
        ? "rgba(96, 223, 255, 0.15)"
        : "rgba(37, 150, 190, 0.1)",
    },
    categoryTabText: {
      fontSize: FontSizes.sm,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    categoryTabTextActive: {
      fontWeight: "600",
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      gap: Spacing.md,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: FontSizes.lg,
      fontWeight: "bold",
      color: BrandColors.primary,
    },
    statLabel: {
      fontSize: FontSizes.xs,
      color: colors.textMuted,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
    },
    listContent: {
      padding: Spacing.md,
      paddingBottom: 120, // Space for bottom tab bar
    },
    paperCard: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    thumbnail: {
      width: "100%",
      height: 140,
      backgroundColor: colors.backgroundAlt,
    },
    thumbnailPlaceholder: {
      justifyContent: "center",
      alignItems: "center",
    },
    paperContent: {
      padding: Spacing.md,
    },
    paperHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    paperTitle: {
      flex: 1,
      fontSize: FontSizes.md,
      fontWeight: "600",
      color: colors.textPrimary,
      lineHeight: 22,
    },
    yearBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.sm,
    },
    yearBadgeText: {
      color: "#fff",
      fontSize: FontSizes.xs,
      fontWeight: "bold",
    },
    paperMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: FontSizes.xs,
      color: colors.textMuted,
    },
    metaDivider: {
      width: 1,
      height: 12,
      backgroundColor: colors.border,
      marginHorizontal: Spacing.sm,
    },
    actionButtons: {
      flexDirection: "row",
      gap: Spacing.sm,
      flexWrap: "wrap",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark
        ? "rgba(37, 150, 190, 0.15)"
        : "rgba(37, 150, 190, 0.1)",
    },
    videoButton: {
      backgroundColor: isDark
        ? "rgba(239, 68, 68, 0.15)"
        : "rgba(239, 68, 68, 0.1)",
    },
    actionButtonText: {
      fontSize: FontSizes.xs,
      fontWeight: "500",
      color: BrandColors.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.md,
    },
    loadingText: {
      fontSize: FontSizes.md,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
      fontSize: FontSizes.xl,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginTop: Spacing.md,
    },
    emptySubtext: {
      fontSize: FontSizes.md,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      lineHeight: 22,
    },
  });
