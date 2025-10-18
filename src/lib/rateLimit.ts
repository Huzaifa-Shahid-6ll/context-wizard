export type RateLimitStatus = { remaining: number; limit: number; retryAfterMs: number };

type RecordEntry = { timestamps: number[] };

const store: Map<string, RecordEntry> = new Map();
let lastSweep = Date.now();

function sweepExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < windowMs) return; // avoid sweeping too often
  for (const [key, entry] of store) {
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
  lastSweep = now;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitStatus {
  const now = Date.now();
  sweepExpired(windowMs);
  const entry = store.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = Math.max(0, oldest + windowMs - now);
    store.set(key, entry); // keep pruned
    return { remaining: 0, limit, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  const remaining = Math.max(0, limit - entry.timestamps.length);
  const nextReset = entry.timestamps[0] + windowMs - now;
  return { remaining, limit, retryAfterMs: Math.max(0, nextReset) };
}

export function getRateLimitStatus(key: string): RateLimitStatus | null {
  const entry = store.get(key);
  if (!entry) return null;
  const now = Date.now();
  const timestamps = entry.timestamps.filter((t) => t > now - 60_000); // default 1m view
  if (timestamps.length === 0) return null;
  const limit = timestamps.length; // unknown limit; expose window remaining as 0
  const retryAfterMs = Math.max(0, timestamps[0] + 60_000 - now);
  return { remaining: 0, limit, retryAfterMs };
}


