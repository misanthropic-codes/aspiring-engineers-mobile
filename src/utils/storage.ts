/**
 * AsyncStorage Wrapper with Type Safety
 * 
 * Mobile equivalent of localStorage wrapper from test-portal-client.
 * Uses AsyncStorage for React Native with proper error handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'test_portal_';

export const storage = {
  /**
   * Get item from AsyncStorage
   */
  get: async <T>(key: string, defaultValue?: T): Promise<T | null> => {
    try {
      const item = await AsyncStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return defaultValue || null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from AsyncStorage for key "${key}":`, error);
      return defaultValue || null;
    }
  },

  /**
   * Set item in AsyncStorage
   */
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to AsyncStorage for key "${key}":`, error);
    }
  },

  /**
   * Remove item from AsyncStorage
   */
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing from AsyncStorage for key "${key}":`, error);
    }
  },

  /**
   * Clear all items with prefix
   */
  clear: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  },

  /**
   * Get multiple items at once
   */
  getMultiple: async <T>(keys: string[]): Promise<Record<string, T | null>> => {
    try {
      const prefixedKeys = keys.map((k) => STORAGE_PREFIX + k);
      const pairs = await AsyncStorage.multiGet(prefixedKeys);
      const result: Record<string, T | null> = {};
      
      pairs.forEach(([key, value]) => {
        const originalKey = key.replace(STORAGE_PREFIX, '');
        result[originalKey] = value ? JSON.parse(value) : null;
      });
      
      return result;
    } catch (error) {
      console.error('Error reading multiple items from AsyncStorage:', error);
      return {};
    }
  },
};

// Storage keys used throughout the app
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  TEST_ATTEMPT: 'test_attempt_',
  QUESTION_TIME: 'question_time_',
  OFFLINE_ATTEMPTS: 'offline_attempts',
  LAST_SYNC: 'last_sync',
} as const;

export default storage;
