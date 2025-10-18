export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
}

type CacheEntry<V> = { value: V; expiresAt: number };

export class LruTtlCache<V> {
  private readonly maxEntries: number;
  private readonly map: Map<string, CacheEntry<V>>;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  get(key: string): V | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      this.misses++;
      return undefined;
    }
    // refresh LRU ordering
    this.map.delete(key);
    this.map.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: V, ttlMs: number): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
    if (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value as string;
      this.map.delete(oldest);
      this.evictions++;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.map.clear();
  }

  stats(): CacheStats {
    return {
      size: this.map.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }
}


