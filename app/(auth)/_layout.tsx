/**
 * Auth Layout - Test Portal Mobile
 * 
 * Stack navigator for authentication screens.
 */

import { Stack } from 'expo-router';
import { LightColors } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: LightColors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
