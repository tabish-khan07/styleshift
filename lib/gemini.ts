import { GoogleGenAI } from '@google/genai';
import { APP_CONFIG, getGeminiApiKey, hasGeminiApiKey } from './config';

// Concurrency limiter for capping parallel calls
export class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];

  constructor(private limit: number = APP_CONFIG.limits.concurrencyCap) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}

export const geminiLimiter = new ConcurrencyLimiter(APP_CONFIG.limits.concurrencyCap);

export function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number; statusCode?: number })?.status ||
                 (err as { status?: number; statusCode?: number })?.statusCode;

  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  const lower = msg.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('503') ||
    lower.includes('500') ||
    lower.includes('overloaded') ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('fetch failed') ||
    lower.includes('econnreset')
  );
}

export function sanitizeErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred.';
  const raw = err instanceof Error ? err.message : String(err);
  
  // Try to parse JSON error message from Google SDK
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) {
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
        return 'Google Gemini is experiencing high traffic. Please retry in a moment.';
      }
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }

  if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
    return 'Google Gemini is currently under heavy traffic. Retrying with backup model...';
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return 'API quota exceeded. Please wait a moment before retrying.';
  }

  return raw;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = APP_CONFIG.limits.retryAttempts,
  initialBackoff: number = APP_CONFIG.limits.initialBackoffMs
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      lastError = err;
      if (attempt >= maxAttempts || !isRetryableError(err)) {
        throw err;
      }
      const jitter = Math.random() * 200;
      const delay = Math.min(
        APP_CONFIG.limits.maxBackoffMs,
        initialBackoff * Math.pow(2, attempt - 1) + jitter
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export interface GenerateTextOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  responseMimeType?: string;
  responseSchema?: unknown;
}

/**
 * Fallback generator used exclusively when no GEMINI_API_KEY is present
 * so users can test the application UI, diffs, and workflow without crashing.
 */
function generateDemoFallback(prompt: string, systemInstruction?: string, mimeType?: string): string {
  if (mimeType === 'application/json' || (systemInstruction && systemInstruction.includes('JSON'))) {
    if (systemInstruction?.includes('judgements')) {
      return JSON.stringify({
        judgements: [
          { styleId: 'formal', styleScore: 94, reason: 'Authoritative vocabulary with impeccable grammatical structure.' },
          { styleId: 'casual', styleScore: 92, reason: 'Approachable, warm conversational tone with natural rhythm.' },
          { styleId: 'gen-z', styleScore: 95, reason: 'Authentic modern slang with expressive cadence.' },
          { styleId: 'shakespearean', styleScore: 96, reason: 'Poetic Elizabethan diction with theatrical flourish.' },
          { styleId: 'linkedin', styleScore: 93, reason: 'Growth mindset framing with inspirational corporate leadership.' },
          { styleId: 'funny', styleScore: 91, reason: 'Self-aware wit and comedic situational framing.' },
          { styleId: 'hinglish', styleScore: 93, reason: 'Authentic bilingual idioms and energetic desi cadence.' },
          { styleId: 'storyteller', styleScore: 94, reason: 'Rich sensory narrative details and cinematic pacing.' },
          { styleId: 'concise', styleScore: 97, reason: 'Maximum word economy with zero lost facts or data.' },
          { styleId: 'my-voice', styleScore: 92, reason: 'Closely matched personal cadence, tone, and sentence structure.' },
        ],
      });
    }

    if (systemInstruction?.includes('forensic linguist')) {
      return JSON.stringify({
        avgSentenceLength: 'Moderate (14-18 words)',
        vocabularyLevel: 'Sharp and accessible',
        tone: 'Confident, direct, and insightful',
        formality: 'Professional Casual',
        favoritePhrases: ['in essence', 'let us dive in', 'fundamentally'],
        punctuationHabits: 'Clean, rhythmic punctuation with purposeful colons',
        doRules: [
          'Lead with strong punchy verbs',
          'Maintain balanced sentence variety',
          'Keep technical descriptions intuitive',
        ],
        dontRules: [
          'Avoid overly bureaucratic corporate jargon',
          'Do not use passive voice unnecessarily',
          'Never pad sentences with meaningless filler',
        ],
        summary:
          'A crisp, modern voice blending professional clarity with conversational approachability.',
      });
    }
  }

  const match = prompt.match(/Target Text to Rewrite:\s*"""\s*([\s\S]*?)\s*"""/);
  const rawText = match ? match[1].trim() : prompt.trim();
  const lowerSys = (systemInstruction || '').toLowerCase();

  if (lowerSys.includes('executive editor') || lowerSys.includes('formal')) {
    return `Esteemed stakeholders, rigorous analysis indicates that: ${rawText.replace(/\b(i|we)\s+think\b/gi, 'preliminary findings suggest')} All pertinent metrics and factual details remain meticulously verified.`;
  }
  if (lowerSys.includes('chronically online') || lowerSys.includes('gen-z')) {
    return `no cap fr, ${rawText.toLowerCase().replace(/[.,!]/g, '')} — we literally locked in and it is so valid.`;
  }
  if (lowerSys.includes('elizabethan') || lowerSys.includes('shakespearean')) {
    return `Hark! For truth hath revealed that ${rawText.replace(/\b(the|our)\b/gi, 'thy')} verily, no tempest nor mortal folly can alter what hath been spoken.`;
  }
  if (lowerSys.includes('linkedin')) {
    return `💡 Critical takeaway from today's operational journey:\n\n"${rawText}"\n\nTrue growth isn't about avoiding friction; it's about leaning into cross-functional resilience and scaling what matters. Agree? 🚀`;
  }
  if (lowerSys.includes('comedian') || lowerSys.includes('funny')) {
    return `Plot twist: ${rawText} In retrospect, this makes about as much sense as bringing a soup spoon to a fencing match, but here we are.`;
  }
  if (lowerSys.includes('hinglish')) {
    return `Arre suno yaar, ${rawText} Bilkul tension mat lo, everything is sorted with solid jugaad!`;
  }
  if (lowerSys.includes('storyteller')) {
    return `Against the gathering dusk, the reality took shape: ${rawText} A solitary breath hung in the stillness, bearing the weight of every unwritten chapter.`;
  }
  if (lowerSys.includes('extreme brevity') || lowerSys.includes('concise')) {
    return rawText.split('. ')[0] + '.';
  }
  if (lowerSys.includes('custom voice clone')) {
    return `Looking at this objectively: ${rawText} The core priority remains executing with clarity and zero fluff.`;
  }

  return `So basically, ${rawText.replace(/\b(subsequent to|furthermore|consequently)\b/gi, 'also')}. That is pretty much the whole story!`;
}

export async function generateGeminiText(options: GenerateTextOptions): Promise<string> {
  if (!hasGeminiApiKey()) {
    return generateDemoFallback(options.prompt, options.systemInstruction, options.responseMimeType);
  }

  // Model cascade: try primary configured model (gemini-2.5-flash),
  // with automatic graceful failover to gemini-2.0-flash or gemini-1.5-flash if high demand 503 occurs
  const candidateModels = [
    options.model || APP_CONFIG.gemini.model,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastErr: unknown;

  for (const model of candidateModels) {
    try {
      return await geminiLimiter.run(async () => {
        return withRetry(async () => {
          const ai = getGeminiClient();

          const response = await ai.models.generateContent({
            model,
            contents: options.prompt,
            config: {
              systemInstruction: options.systemInstruction,
              responseMimeType: options.responseMimeType,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              responseSchema: options.responseSchema as any,
              temperature: 0.7,
            },
          });

          const text = response.text?.trim() || '';
          return text;
        });
      });
    } catch (err: unknown) {
      lastErr = err;
      if (isRetryableError(err)) {
        console.warn(`Model ${model} returned high demand/error, attempting failover model...`);
        continue;
      }
      throw new Error(sanitizeErrorMessage(err));
    }
  }

  throw new Error(sanitizeErrorMessage(lastErr));
}

export async function generateGeminiEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  if (!hasGeminiApiKey()) {
    return texts.map((t, idx) => {
      const vec = new Array(32).fill(0);
      for (let i = 0; i < t.length; i++) {
        vec[i % 32] += t.charCodeAt(i) / (1000 + idx);
      }
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
      return vec.map((v) => v / norm);
    });
  }

  const candidateModels = [
    APP_CONFIG.gemini.embeddingModel,
    'text-embedding-004',
  ];

  let lastErr: unknown;

  for (const model of candidateModels) {
    try {
      return await geminiLimiter.run(async () => {
        return withRetry(async () => {
          const ai = getGeminiClient();

          const response = await ai.models.embedContent({
            model,
            contents: texts,
          });

          if (!response.embeddings || response.embeddings.length === 0) {
            throw new Error('No embeddings returned by Gemini embedding model.');
          }

          return response.embeddings.map((item) => item.values || []);
        });
      });
    } catch (err: unknown) {
      lastErr = err;
      if (isRetryableError(err)) {
        continue;
      }
      break;
    }
  }

  // Graceful fallback to pseudo-embeddings if external embedding service is temporarily unavailable
  console.warn('Embedding service unavailable, falling back to deterministic representation:', sanitizeErrorMessage(lastErr));
  return texts.map((t, idx) => {
    const vec = new Array(32).fill(0);
    for (let i = 0; i < t.length; i++) {
      vec[i % 32] += t.charCodeAt(i) / (1000 + idx);
    }
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  });
}
