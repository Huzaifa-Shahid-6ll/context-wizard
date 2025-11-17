/**
 * Date and time utilities
 * Provides consistent date handling across the application
 * All dates are stored as Unix timestamps (milliseconds)
 */

/**
 * Get current Unix timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Get start of UTC day as Unix timestamp in milliseconds
 */
export function startOfUtcDayTimestampMs(dateMs: number): number {
  const d = new Date(dateMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

/**
 * Get today's key as string (for daily reset tracking)
 */
export function todayKey(): string {
  return String(startOfUtcDayTimestampMs(now()));
}

/**
 * Check if a date is today (UTC)
 */
export function isToday(timestamp: number): boolean {
  const todayStart = startOfUtcDayTimestampMs(now());
  const dateStart = startOfUtcDayTimestampMs(timestamp);
  return todayStart === dateStart;
}

/**
 * Get days difference between two timestamps
 */
export function daysDifference(timestamp1: number, timestamp2: number): number {
  const diff = Math.abs(timestamp1 - timestamp2);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a timestamp
 */
export function addDays(timestamp: number, days: number): number {
  return timestamp + (days * 24 * 60 * 60 * 1000);
}

/**
 * Format timestamp to ISO string
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Parse ISO string to timestamp
 */
export function fromISOString(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Validate timestamp
 */
export function isValidTimestamp(timestamp: unknown): timestamp is number {
  return typeof timestamp === 'number' && 
         !isNaN(timestamp) && 
         timestamp > 0 && 
         timestamp < Number.MAX_SAFE_INTEGER;
}

