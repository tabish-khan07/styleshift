import crypto from 'crypto';
import { APP_CONFIG } from './config';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class LRUCache<T> {
  private capacity: number;
  private map: Map<string, CacheEntry<T>>;

  constructor(capacity = APP_CONFIG.limits.cacheMaxEntries) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key: string): T | undefined {
    const item = this.map.get(key);
    if (!item) return undefined;
    // Move to most recently used
    this.map.delete(key);
    this.map.set(key, item);
    return item.value;
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Delete least recently used (first key in map)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
      }
    }
    this.map.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }
}

export function computeCacheKey(text: string, styleId: string, intensity: string): string {
  const normalized = `${text.trim()}:::${styleId}:::${intensity}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Global in-memory singleton for serverless runtime instance reuse
export const rewriteCache = new LRUCache<string>();
