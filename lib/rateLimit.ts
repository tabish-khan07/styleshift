import { APP_CONFIG } from './config';

interface RateLimitRecord {
  timestamps: number[];
}

class InMemoryRateLimiter {
  private records: Map<string, RateLimitRecord>;
  private maxRequests: number;
  private windowMs: number;

  constructor(
    maxRequests = APP_CONFIG.limits.rateLimitRequests,
    windowMs = APP_CONFIG.limits.rateLimitWindowMs
  ) {
    this.records = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic cleanup of stale IPs every 5 minutes to prevent memory leak
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  check(identifier: string): { success: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      return {
        success: false,
        remaining: 0,
        resetMs,
      };
    }

    record.timestamps.push(now);
    return {
      success: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetMs: this.windowMs,
    };
  }

  private cleanup(): void {
    const windowStart = Date.now() - this.windowMs;
    for (const [ip, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.records.delete(ip);
      }
    }
  }
}

export const rateLimiter = new InMemoryRateLimiter();

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(',');
    if (firstIp && firstIp.trim()) {
      return firstIp.trim();
    }
  }
  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
