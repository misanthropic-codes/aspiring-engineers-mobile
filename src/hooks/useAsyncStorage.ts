/**
 * useAsyncStorage Hook - Test Portal Mobile
 * 
 * Mobile equivalent of useLocalStorage from test-portal-client.
 * Uses AsyncStorage for persistent state.
 */

import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

export function useAsyncStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, () => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await storage.get<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error(`Error loading from AsyncStorage for key "${key}":`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Set value function
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await storage.set(key, valueToStore);
      } catch (error) {
        console.error(`Error writing to AsyncStorage for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value function
  const removeValue = useCallback(async () => {
    try {
      await storage.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing from AsyncStorage for key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, loading];
}

export default useAsyncStorage;
