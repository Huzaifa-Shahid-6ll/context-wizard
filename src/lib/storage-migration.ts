/**
 * Migration utility for localStorage keys
 * Helps migrate from old key names to new standardized names
 */

import { getStorageItem, setStorageItem, removeStorageItem } from './storage';

/**
 * Migration map: old key -> new key
 */
const MIGRATION_MAP: Record<string, string> = {
  'genericPrompt.v1': 'genericPrompt',
  'cursorBuilder.v1': 'cursorBuilder',
  'imagePromptStructuredForm.v1': 'imagePrompt',
  'videoPromptStructuredForm.v1': 'videoPrompt',
  'cw_settings_prefs': 'settings',
  'mode:genericPrompt': 'mode_genericPrompt',
  'auth_flow': 'authFlow',
};

/**
 * Migrate old localStorage keys to new format
 */
export function migrateStorageKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    Object.entries(MIGRATION_MAP).forEach(([oldKey, newKey]) => {
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue) {
        try {
          // Try to parse and migrate
          const parsed = JSON.parse(oldValue);
          setStorageItem(newKey, parsed);
          // Remove old key after successful migration
          localStorage.removeItem(oldKey);
        } catch {
          // If parsing fails, try to migrate as string
          setStorageItem(newKey, oldValue);
          localStorage.removeItem(oldKey);
        }
      }
    });
  } catch (error) {
    console.error('Storage migration failed:', error);
  }
}

/**
 * Get storage item with automatic migration
 */
export function getStorageItemWithMigration<T = unknown>(key: string): T | null {
  // First, run migration
  migrateStorageKeys();

  // Check if key needs migration
  const oldKey = Object.keys(MIGRATION_MAP).find((k) => MIGRATION_MAP[k] === key);
  if (oldKey) {
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue) {
      try {
        const parsed = JSON.parse(oldValue);
        setStorageItem(key, parsed);
        localStorage.removeItem(oldKey);
        return parsed as T;
      } catch {
        const value = oldValue as unknown as T;
        setStorageItem(key, value);
        localStorage.removeItem(oldKey);
        return value;
      }
    }
  }

  // Try new key format
  return getStorageItem<T>(key);
}

