/**
 * Root Layout - Test Portal Mobile
 *
 * Sets up the root navigation and providers.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BrandColors } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Inner component that can safely use hooks
function RootLayoutNav() {
  const { authState } = useAuth();
  // potentially use theme hook here too for background color

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: BrandColors.primary, 
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
