/**
 * Root Layout - Test Portal Mobile
 * 
 * Sets up the root navigation and providers.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LightColors } from '../src/constants/theme';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: LightColors.background,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
