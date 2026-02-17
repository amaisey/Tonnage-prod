import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes — skip write if unchanged
  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(key);
      const newVal = JSON.stringify(storedValue);
      if (existing !== newVal) {
        window.localStorage.setItem(key, newVal);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for external changes (e.g. mergeIntoLocalStorage dispatching 'storage' event)
  // This ensures React state stays in sync when sync pull writes directly to localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          setStoredValue(prev => {
            // Only update if actually different (compare serialized to avoid infinite loops)
            const prevStr = JSON.stringify(prev);
            return prevStr !== item ? parsed : prev;
          });
        }
      } catch (error) {
        console.error(`Error reading localStorage on storage event for "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
}
