/**
 * Counselling Layout - Aspiring Engineers Mobile
 * 
 * Stack navigation for counselling screens
 */

import { Stack } from 'expo-router';
import { BrandColors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function CounsellingLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: isDark ? colors.textPrimary : BrandColors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Counselling',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="sessions"
        options={{
          title: 'My Sessions',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="book-session"
        options={{
          title: 'Book Session',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="counsellors"
        options={{
          title: 'Our Counsellors',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
