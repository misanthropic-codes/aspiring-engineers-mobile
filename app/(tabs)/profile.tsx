/**
 * Profile Screen - Test Portal Mobile
 * 
 * User profile with settings and logout functionality.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import {
    BorderRadius,
    BrandColors,
    FontSizes,
    LightColors,
    Spacing,
} from '../../src/constants/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { formatExamType } from '../../src/utils/formatters';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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

        {/* Menu Items */}
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
                  color={LightColors.textSecondary}
                />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={LightColors.textMuted}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightColors.background,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: LightColors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  userCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
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
    color: LightColors.textPrimary,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: LightColors.textMuted,
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
  menuCard: {
    marginBottom: Spacing.lg,
    padding: 0,
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
    borderBottomColor: LightColors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: FontSizes.base,
    color: LightColors.textPrimary,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    marginBottom: Spacing.md,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    color: LightColors.textMuted,
  },
});
