import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BrandColors, ColorScheme } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function PdfViewerScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // If it's a direct PDF link, we can use Google Docs Viewer to render it in WebView
  // If it's already a drive viewer link, use it directly.
  const getViewerUrl = (targetUrl: string) => {
    if (!targetUrl) return '';
    if (targetUrl.includes('drive.google.com/file/d/')) {
        // Embed mode for drive files
        return targetUrl.replace('/view', '/preview');
    }
    // For raw PDFs, use Google Docs Viewer
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(targetUrl)}`;
  };

  const finalUrl = getViewerUrl(url);

  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: title || 'Document Viewer',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }} 
      />
      
      {finalUrl ? (
          <WebView
            source={{ uri: finalUrl }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            )}
            // Enable zoom on Android
            scalesPageToFit={true} 
            domStorageEnabled={true}
          />
      ) : (
          <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.error} /> 
          </View>
      )}
    </View>
  );
}

const getStyles = (colors: ColorScheme, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
