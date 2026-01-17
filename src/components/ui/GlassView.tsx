import { BlurView, BlurViewProps } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: BlurViewProps['tint'];
}

export const GlassView = ({
  style,
  children,
  intensity = 80,
  tint,
  ...props
}: GlassViewProps) => {
  const { isDark, colors } = useTheme();

  if (Platform.OS !== 'ios') {
    return (
      <View style={[style, { backgroundColor: colors.background }]} {...props}>
        {children}
      </View>
    );
  }

  // Determine tint based on theme if not provided
  const actualTint = tint || (isDark ? 'dark' : 'light');
  
  // For glass effect, we want a very transparent background or no background on the container
  // The blur view itself provides the background visual
  return (
    <BlurView
      intensity={intensity}
      tint={actualTint}
      style={[style, styles.glass]} // Ensure style is applied to BlurView to match layout
      {...props as any} // BlurView has slightly different props but overlaps with ViewProps
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  glass: {
    overflow: 'hidden',
  },
});
