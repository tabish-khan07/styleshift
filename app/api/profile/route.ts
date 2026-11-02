import { NextRequest, NextResponse } from 'next/server';
import { profileRequestSchema } from '@/lib/schemas';
import { rateLimiter, getClientIp } from '@/lib/rateLimit';
import { generateGeminiText, generateGeminiEmbeddings } from '@/lib/gemini';
import { calculateCentroid } from '@/lib/scoring';
import { VoiceProfile, ProfileResponse } from '@/types';

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

    const validation = profileRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: firstError } },
        { status: 400 }
      );
    }

    const { samples } = validation.data;

    // 3. Batched embeddings call for centroid
    let centroid: number[] = [];
    try {
      const sampleEmbeddings = await generateGeminiEmbeddings(samples);
      centroid = calculateCentroid(sampleEmbeddings);
    } catch (embeddingErr) {
      console.warn('Embedding centroid calculation failed:', embeddingErr);
    }

    // 4. Gemini structured voice profile extraction
    const samplesBlock = samples
      .map((s, i) => `[Sample ${i + 1}]\n"""\n${s}\n"""`)
      .join('\n\n');

    const systemInstruction = `You are an elite forensic linguist and stylistic profiler.
Analyze the provided writing samples from an individual. Extract their exact personal writing DNA and voice traits.

Return STRICT JSON matching this schema:
{
  "avgSentenceLength": string (e.g. "Short & Punchy (8-12 words)" or "Elaborate & Flowing (22-28 words)"),
  "vocabularyLevel": string (e.g. "Conversational & Accessible", "Sophisticated & Technical", or "Poetic"),
  "tone": string (e.g. "Empathetic, introspective, with sharp wit"),
  "formality": string (e.g. "Casual professional with colloquial warmth"),
  "favoritePhrases": string[] (3-5 characteristic phrases, idioms, or recurring cadences seen or implied),
  "punctuationHabits": string (e.g. "Frequent em-dashes and concise fragments"),
  "doRules": string[] (3 specific stylistic instructions to emulate this voice),
  "dontRules": string[] (3 specific pitfalls to avoid when emulating this voice),
  "summary": string (A crisp 2-sentence summary of this person's voice persona)
}`;

    const prompt = `Writing Samples to Profile:
${samplesBlock}

Extract the profile and output JSON only.`;

    const rawJson = await generateGeminiText({
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    let profile: VoiceProfile;
    try {
      profile = JSON.parse(rawJson) as VoiceProfile;
    } catch {
      profile = {
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
      };
    }

    profile.centroid = centroid;

    const responsePayload: ProfileResponse = {
      profile,
      summary: profile.summary,
      centroid,
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error while building voice profile.';
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
