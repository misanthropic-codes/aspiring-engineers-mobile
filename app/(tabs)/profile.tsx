/**
 * Profile Screen - Test Portal Mobile
 * 
 * User profile with settings and logout functionality.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    ColorScheme,
    FontSizes,
    Spacing,
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { formatExamType } from '../../src/utils/formatters';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => {},
    },
    {
      icon: 'lock-closed-outline',
      label: 'Change Password',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Card style={styles.userCard} variant="elevated">
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={BrandColors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Student'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              {user?.examTargets && user.examTargets.length > 0 && (
                <View style={styles.examBadge}>
                  <Text style={styles.examBadgeText}>
                    {formatExamType(user.examTargets[0])}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Appearance Settings */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <Card style={styles.menuCard}>
            <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                    <Ionicons
                        name={isDark ? "moon" : "sunny"}
                        size={22}
                        color={colors.textSecondary}
                    />
                    <Text style={styles.menuItemLabel}>Dark Mode</Text>
                </View>
                <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: BrandColors.primary }}
                    thumbColor={isDark ? '#fff' : '#f4f3f4'}
                />
            </View>
        </Card>


        {/* Menu Items */}
        <Text style={styles.sectionHeader}>Settings</Text>
        <Card style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onPress={handleLogout}
          fullWidth
          style={styles.logoutButton}
        >
          Logout
        </Button>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  userCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: colors.card,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: `${BrandColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  examBadge: {
    backgroundColor: `${BrandColors.primary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  examBadgeText: {
    fontSize: FontSizes.xs,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  sectionHeader: {
      fontSize: FontSizes.sm,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: Spacing.sm,
      marginBottom: Spacing.sm,
      marginLeft: Spacing.sm,
  },
  menuCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: FontSizes.base,
    color: colors.textPrimary,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    marginBottom: Spacing.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: colors.textMuted,
  },
});
