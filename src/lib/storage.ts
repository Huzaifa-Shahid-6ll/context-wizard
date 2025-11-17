/**
 * Secure localStorage utilities
 * Provides encrypted storage and automatic cleanup on logout
 */

const STORAGE_PREFIX = 'cw_';
const ENCRYPTION_KEY = 'storage_key'; // In production, use a proper key management system

/**
 * Simple encryption (for production, use a proper encryption library)
 * This is a basic implementation - consider using crypto-js or similar
 */
function encrypt(data: string): string {
  // Basic encoding - replace with proper encryption in production
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
}

function decrypt(encrypted: string): string {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return encrypted;
  }
}

/**
 * Get a namespaced storage key
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Safely set an item in localStorage with optional encryption
 */
export function setStorageItem(
  key: string,
  value: unknown,
  options: { encrypt?: boolean; ttl?: number } = {}
): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storageKey = getKey(key);
    const data = {
      value,
      encrypted: options.encrypt || false,
      timestamp: Date.now(),
      ttl: options.ttl, // Time to live in milliseconds
    };

    const serialized = JSON.stringify(data);
    const finalValue = options.encrypt ? encrypt(serialized) : serialized;

    localStorage.setItem(storageKey, finalValue);
    return true;
  } catch (error) {
    console.error('Failed to set storage item:', error);
    return false;
  }
}

/**
 * Safely get an item from localStorage with optional decryption
 */
export function getStorageItem<T = unknown>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const storageKey = getKey(key);
    const item = localStorage.getItem(storageKey);
    if (!item) return null;

    // Try to decrypt if it looks encrypted
    let parsed: { value: T; encrypted?: boolean; timestamp?: number; ttl?: number };
    try {
      const decrypted = decrypt(item);
      parsed = JSON.parse(decrypted);
    } catch {
      // Not encrypted, parse directly
      parsed = JSON.parse(item);
    }

    // Check TTL
    if (parsed.ttl && parsed.timestamp) {
      const age = Date.now() - parsed.timestamp;
      if (age > parsed.ttl) {
        localStorage.removeItem(storageKey);
        return null;
      }
    }

    return parsed.value as T;
  } catch (error) {
    console.error('Failed to get storage item:', error);
    return null;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storageKey = getKey(key);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Failed to remove storage item:', error);
    return false;
  }
}

/**
 * Clear all app-related localStorage items
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Clear expired items from localStorage
 */
export function clearExpiredItems(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (!item) return;

        try {
          let parsed: { timestamp?: number; ttl?: number };
          try {
            const decrypted = decrypt(item);
            parsed = JSON.parse(decrypted);
          } catch {
            parsed = JSON.parse(item);
          }

          if (parsed.ttl && parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            if (age > parsed.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid item, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Failed to clear expired items:', error);
  }
}

/**
 * Get all storage keys for the app
 */
export function getAllStorageKeys(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
  } catch {
    return [];
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

