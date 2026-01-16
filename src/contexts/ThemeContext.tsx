import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, DarkColors, LightColors, ThemeMode } from '../constants/theme';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface ThemeContextType {
  theme: ThemeMode;
  colors: ColorScheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await storage.get<ThemeMode>(STORAGE_KEYS.THEME);
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (systemScheme) {
      setThemeState(systemScheme as ThemeMode);
    }
    setLoaded(true);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    storage.set(STORAGE_KEYS.THEME, mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? DarkColors : LightColors;
  const isDark = theme === 'dark';

  if (!loaded) {
    return null; // Or a splash screen
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
