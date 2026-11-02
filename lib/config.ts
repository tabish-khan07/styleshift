export const APP_CONFIG = {
  appName: 'StyleShift',
  tagline: 'Precision AI Text Style Rewriter',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  },
  limits: {
    maxTextLength: 3000,
    maxStylesPerRequest: 6,
    concurrencyCap: 4,
    retryAttempts: 3,
    initialBackoffMs: 800,
    maxBackoffMs: 5000,
    rateLimitRequests: 10,
    rateLimitWindowMs: 60 * 1000, // 1 minute
    cacheMaxEntries: 200,
  },
} as const;

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_gemini_api_key_here')) {
    return null;
  }
  return key.trim();
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey() !== null;
}
