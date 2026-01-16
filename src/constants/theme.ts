/**
 * Theme Constants - Aspiring Engineers Mobile
 * 
 * Ported from test-portal-client globals.css
 * Centralized color definitions for consistent theming
 */

// Brand Colors - Aspiring Engineers
export const BrandColors = {
  primary: '#2596be',
  secondary: '#4EA8DE',
  light: '#60DFFF',
} as const;

// Light Theme Colors
export const LightColors = {
  background: '#FAFAFA',       // rgb(250, 250, 250)
  foreground: '#0F172A',       // rgb(15, 23, 42)
  card: '#FFFFFF',             // rgb(255, 255, 255)
  cardForeground: '#0F172A',   // rgb(15, 23, 42)
  border: '#E5E7EB',           // rgb(229, 231, 235)
  input: '#E5E7EB',            // rgb(229, 231, 235)
  ring: '#2596be',             // Brand primary
  textPrimary: '#0F172A',      // rgb(15, 23, 42)
  textSecondary: '#475569',    // rgb(71, 85, 105)
  textMuted: '#64748B',        // rgb(100, 116, 139)
  // Status colors
  success: '#22C55E',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
} as const;

// Dark Theme Colors
export const DarkColors = {
  background: '#071219',       // rgb(7, 18, 25)
  foreground: '#F8FAFC',       // rgb(248, 250, 252)
  card: '#0F172A',             // rgb(15, 23, 42)
  cardForeground: '#F8FAFC',   // rgb(248, 250, 252)
  border: 'rgba(255, 255, 255, 0.1)',
  input: 'rgba(255, 255, 255, 0.15)',
  ring: '#60DFFF',             // Brand light
  textPrimary: '#F8FAFC',      // rgb(248, 250, 252)
  textSecondary: '#CBD5E1',    // rgb(203, 213, 225)
  textMuted: '#94A3B8',        // rgb(148, 163, 184)
  // Status colors
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.1)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.1)',
} as const;

// Combined Colors object for easy theme switching
export const Colors = {
  brand: BrandColors,
  light: LightColors,
  dark: DarkColors,
} as const;

// Spacing scale (based on 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Font sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Font weights
export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets for cards and elevations
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;

// Type exports
export type ThemeMode = 'light' | 'dark';
export type ColorScheme = typeof LightColors | typeof DarkColors;
