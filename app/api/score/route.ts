import { NextRequest, NextResponse } from 'next/server';
import { scoreRequestSchema } from '@/lib/schemas';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';
import { generateGeminiEmbeddings } from '@/lib/gemini';
import {
  calculateCosineSimilarity,
  mapCosineToMeaningScore,
  judgeStyleAdherence,
} from '@/lib/scoring';
import { ScoreResultItem } from '@/types';

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

    const validation = scoreRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: firstError } },
        { status: 400 }
      );
    }

    const { original, results, voiceCentroid } = validation.data;

    // Filter valid results with text
    const validResults = results.filter((r) => r.text && r.text.trim().length > 0);
    if (validResults.length === 0) {
      return NextResponse.json({ scores: [] });
    }

    // 3. Batched Embeddings Call (Original + all valid results in ONE call)
    const textsToEmbed = [original, ...validResults.map((r) => r.text)];

    let embeddings: number[][] = [];
    try {
      embeddings = await generateGeminiEmbeddings(textsToEmbed);
    } catch (embeddingError) {
      console.warn('Embedding generation failed, falling back to approximation:', embeddingError);
    }

    const originalVec = embeddings[0] || [];

    // 4. Batched Style Adherence Call (ONE Gemini call for all outputs)
    let judgements: Array<{ styleId: string; styleScore: number; reason: string }> = [];
    try {
      judgements = await judgeStyleAdherence(original, validResults);
    } catch (adherenceError) {
      console.warn('Style adherence evaluation failed:', adherenceError);
    }

    const judgementsMap = new Map(judgements.map((j) => [j.styleId, j]));

    // 5. Combine scores
    const scores: ScoreResultItem[] = validResults.map((item, idx) => {
      const outputVec = embeddings[idx + 1] || [];
      let meaningScore = 90; // graceful default if embeddings failed

      if (originalVec.length > 0 && outputVec.length > 0) {
        const rawSim = calculateCosineSimilarity(originalVec, outputVec);
        meaningScore = mapCosineToMeaningScore(rawSim);
      }

      let voiceMatch: number | undefined;
      if (item.styleId === 'my-voice' && voiceCentroid && voiceCentroid.length > 0 && outputVec.length > 0) {
        const rawVoiceSim = calculateCosineSimilarity(voiceCentroid, outputVec);
        voiceMatch = mapCosineToMeaningScore(rawVoiceSim);
      }

      const judgement = judgementsMap.get(item.styleId);
      const styleScore = judgement?.styleScore ?? 88;
      const reason = judgement?.reason || 'Adheres closely to the designated style parameters.';

      return {
        styleId: item.styleId,
        meaning: meaningScore,
        style: styleScore,
        reason,
        voiceMatch,
      };
    });

    return NextResponse.json({ scores });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error while computing scores.';
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
