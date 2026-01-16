/**
 * Index Page - Test Portal Mobile
 * 
 * Entry point that redirects based on authentication state.
 */

import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BrandColors, LightColors } from '../src/constants/theme';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/(auth)/login' as any);
      }
    }
  }, [isAuthenticated, loading]);

  // Show loading spinner while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={BrandColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightColors.background,
  },
});
