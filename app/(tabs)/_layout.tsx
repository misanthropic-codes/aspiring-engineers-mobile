/**
 * Tabs Layout - Test Portal Mobile
 * 
 * Bottom tab navigation with a custom floating glass design.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // Calculate specific metrics for the floating bar
  // Pushing it further down as requested. 
  // For iOS notched devices, insets.bottom is ~34. We subtract some to bring it closer to the home indicator.
  const bottomMargin = Platform.OS === 'ios' ? Math.max(insets.bottom - 15, 10) : 12; 
  const tabHeight = 60;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: isDark ? '#A1A1AA' : '#94A3B8',
        tabBarShowLabel: false, // WhatsApp style leans towards minimal/icon-only or very subtle labels. User asked for "whats app styled floating tab bar", normally WA is not floating, but "floating" usually implies pill shape.
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomMargin,
          left: 20,
          right: 20,
          height: tabHeight,
          borderRadius: 30, // Pill shape
          borderTopWidth: 0,
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)', // Semi-transparent for glass effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarBackground: () => (
            <View style={StyleSheet.absoluteFill}> 
                {/* 
                  Wrapper View needed for borderRadius clipping on Android/some cases 
                  where BlurView alone might not respect specific border styling easily 
                */}
                <BlurView 
                    intensity={Platform.OS === 'ios' ? 80 : 30} 
                    tint={isDark ? 'dark' : 'light'} 
                    style={[
                        StyleSheet.absoluteFill, 
                        { borderRadius: 30, overflow: 'hidden' }
                    ]} 
                />
            </View>
        ),
        tabBarItemStyle: {
            height: tabHeight,
            paddingVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
