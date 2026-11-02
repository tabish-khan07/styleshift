import { describe, it, expect, vi } from 'vitest';
import { withRetry, isRetryableError } from '../gemini';

describe('Retry & Backoff Logic', () => {
  it('identifies 429 and 5xx errors as retryable', () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
    expect(isRetryableError({ status: 500 })).toBe(true);
    expect(isRetryableError({ status: 503 })).toBe(true);
    expect(isRetryableError(new Error('Resource has been exhausted (e.g. check quota)'))).toBe(true);
    expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
    expect(isRetryableError(new Error('fetch failed'))).toBe(true);
  });

  it('identifies non-retryable errors correctly', () => {
    expect(isRetryableError({ status: 400 })).toBe(false);
    expect(isRetryableError({ status: 401 })).toBe(false);
    expect(isRetryableError(new Error('Invalid argument provided'))).toBe(false);
    expect(isRetryableError(null)).toBe(false);
  });

  it('resolves immediately without retry on initial success', async () => {
    const mockFn = vi.fn().mockResolvedValue('success-result');
    const result = await withRetry(mockFn, 3, 10);
    expect(result).toBe('success-result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable failure and succeeds', async () => {
    const error429 = new Error('429 Too Many Requests');
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce('recovered-result');

    const result = await withRetry(mockFn, 3, 10);
    expect(result).toBe('recovered-result');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('exhausts maxAttempts and throws if failures persist', async () => {
    const error503 = new Error('503 Service Unavailable');
    const mockFn = vi.fn().mockRejectedValue(error503);

    await expect(withRetry(mockFn, 3, 10)).rejects.toThrow('503 Service Unavailable');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const error400 = new Error('400 Bad Request');
    (error400 as { status?: number }).status = 400;
    const mockFn = vi.fn().mockRejectedValue(error400);

    await expect(withRetry(mockFn, 3, 10)).rejects.toThrow('400 Bad Request');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
