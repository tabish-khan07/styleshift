import { NextRequest, NextResponse } from 'next/server';
import { rewriteRequestSchema } from '@/lib/schemas';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';
import { rewriteCache, computeCacheKey } from '@/lib/cache';
import { buildRewritePrompt } from '@/lib/styles';
import { generateGeminiText, sanitizeErrorMessage } from '@/lib/gemini';
import { RewriteResultItem, StyleId } from '@/types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const clientIp = getClientIp(req.headers);
    const rateCheck = rateLimiter.check(clientIp);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${Math.ceil(rateCheck.resetMs / 1000)}s.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    // 2. Body Validation
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid JSON payload.' } },
        { status: 400 }
      );
    }

    const validation = rewriteRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: firstError } },
        { status: 400 }
      );
    }

    const { text, styles, intensity, voiceProfile } = validation.data;

    // 3. Process styles in parallel with per-card resilience and LRU caching
    const tasks = styles.map(async (styleId: StyleId): Promise<RewriteResultItem> => {
      // Check cache first
      const cacheKey = computeCacheKey(text, styleId, intensity);
      const cached = rewriteCache.get(cacheKey);
      if (cached) {
        return { styleId, text: cached };
      }

      try {
        const { systemInstruction, userPrompt } = buildRewritePrompt(
          text,
          styleId,
          intensity,
          voiceProfile
        );

        const rewritten = await generateGeminiText({
          systemInstruction,
          prompt: userPrompt,
        });

        if (!rewritten) {
          throw new Error('Gemini produced an empty rewrite output.');
        }

        // Cache the successful rewrite
        rewriteCache.set(cacheKey, rewritten);

        return {
          styleId,
          text: rewritten,
        };
      } catch (err: unknown) {
        const message = sanitizeErrorMessage(err);
        return {
          styleId,
          text: '',
          error: message,
        };
      }
    });

    const settled = await Promise.allSettled(tasks);
    const results: RewriteResultItem[] = settled.map((outcome, idx) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value;
      }
      return {
        styleId: styles[idx],
        text: '',
        error: outcome.reason?.message || 'Processing failed.',
      };
    });

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error while processing rewrites.';
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
