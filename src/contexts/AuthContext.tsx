/**
 * Authentication Context - Test Portal Mobile
 * 
 * Provides authentication state and methods to the app.
 * Handles login, logout, registration, and session management.
 */

import { router } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import authService, { RegisterResponse } from '../services/auth.service';
import userService from '../services/user.service';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { tokenManager } from '../utils/tokenManager';


// ============================================
// Types
// ============================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasTokens = await tokenManager.hasTokens();
        const savedUser = await storage.get<User>(STORAGE_KEYS.USER);

        if (hasTokens && savedUser) {
          setUser(savedUser);
          console.log('✅ Session restored from storage');
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);

      // Store tokens securely
      await tokenManager.setAuthToken(response.token);
      await tokenManager.setRefreshToken(response.refreshToken);
      
      // Store user data
      await storage.set(STORAGE_KEYS.USER, response.user);
      setUser(response.user);

      // Fetch full profile immediately to get stats
      try {
        const fullProfile = await userService.getUserProfile();
        await storage.set(STORAGE_KEYS.USER, fullProfile);
        setUser(fullProfile);
      } catch (e) {
        console.warn('Could not fetch full profile during login:', e);
      }
      
      // Navigate to dashboard
      router.replace('/(tabs)' as any);
    } catch (error) {
      throw error;
    }
  }, []);

  // Register handler
  const register = useCallback(async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      // Registration returns email/name but NO tokens (user must verify email first)
      const response = await authService.register(data);

      console.log('✅ Registration successful, OTP sent to:', response.email);

      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  // Refresh session handler
  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = await tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing session...');
      const response = await authService.refreshToken(refreshToken);

      if (response.refreshToken) {
        console.log('✅ Session refreshed with new refresh token');
      } else {
        console.log('✅ Session refreshed with same refresh token');
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  }, []);

  // Refresh profile handler
  const refreshProfile = useCallback(async () => {
    try {
      const updatedUser = await userService.getUserProfile();

      // Update state and storage
      await storage.set(STORAGE_KEYS.USER, updatedUser);
      setUser(updatedUser);

      console.log('✅ Profile refreshed successfully');
    } catch (error) {
      console.error('❌ Profile refresh failed:', error);
      // Fallback: try auth profile if detailed profile fails
      try {
        const minimalUser = await authService.getCurrentUser();
        setUser(prev => ({ ...prev, ...minimalUser } as User));
      } catch (e) {
        console.error('❌ Minimal profile fallback also failed');
      }
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API fails
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens and local storage, then redirect
      await tokenManager.clearTokens();
      await storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      
      // Navigate to login
      router.replace('/(auth)/login' as any);
    }
  }, []);

  // ============================================
  // Render
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshSession,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
