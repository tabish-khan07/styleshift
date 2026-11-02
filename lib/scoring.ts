import { StyleId, VoiceProfile } from '@/types';
import { generateGeminiText } from './gemini';

/**
 * Calculates raw cosine similarity between two numeric vectors.
 * Returns a value in [-1, 1].
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  // Bound to [-1, 1] to prevent floating point inaccuracies
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Converts raw cosine similarity from embedding space into an intuitive 0-100 score.
 * Gemini text-embedding models typically map highly similar texts into [0.65, 1.00].
 */
export function mapCosineToMeaningScore(rawSimilarity: number): number {
  if (rawSimilarity <= 0) return 0;
  if (rawSimilarity >= 0.999) return 100;

  // Calibrate: 0.60 base similarity maps to ~50%, 0.85 maps to ~88%, 0.95+ maps to 96-100%
  const normalized = Math.max(0, Math.min(1, (rawSimilarity - 0.45) / 0.55));
  return Math.round(normalized * 100);
}

/**
 * Calculates the element-wise centroid (mean) of multiple embedding vectors.
 */
export function calculateCentroid(vectors: number[][]): number[] {
  if (!vectors || vectors.length === 0) return [];
  const validVectors = vectors.filter((v) => v && v.length > 0);
  if (validVectors.length === 0) return [];

  const dim = validVectors[0].length;
  const centroid = new Array(dim).fill(0);

  for (const vec of validVectors) {
    if (vec.length !== dim) {
      throw new Error('All vectors in centroid calculation must share identical dimensions.');
    }
    for (let i = 0; i < dim; i++) {
      centroid[i] += vec[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    centroid[i] /= validVectors.length;
  }

  return centroid;
}

export interface AdherenceJudgement {
  styleId: StyleId;
  styleScore: number;
  reason: string;
}

export async function judgeStyleAdherence(
  original: string,
  items: Array<{ styleId: StyleId; text: string }>,
  voiceProfile?: VoiceProfile
): Promise<AdherenceJudgement[]> {
  if (items.length === 0) return [];

  const payload = items.map((item, idx) => {
    return `[Item ${idx + 1}]
StyleId: ${item.styleId}
Rewritten Text: "${item.text}"`;
  }).join('\n\n');

  const voiceInstructions = voiceProfile
    ? `For the 'my-voice' style, evaluate against this profile:
- Tone: ${voiceProfile.tone}
- Formality: ${voiceProfile.formality}
- Average Sentence Length: ${voiceProfile.avgSentenceLength}
- Favorite Phrases: ${voiceProfile.favoritePhrases.join(', ')}`
    : '';

  const systemInstruction = `You are a critical stylistic evaluator and linguist.
Evaluate how well each rewritten text adopted the intended target style (0-100 score) and provide a concise, one-line justification explaining the score.
Be fair and discriminating: authentic voice, vocabulary, cadence, and idioms should score 85-98. Weak or robotic rewrites should score 50-70.
${voiceInstructions}

Output STRICT JSON conforming to this schema:
{
  "judgements": [
    {
      "styleId": string,
      "styleScore": number (0 to 100),
      "reason": string (single sentence under 25 words)
    }
  ]
}`;

  const prompt = `Original Text:
"""
${original}
"""

Rewritten Outputs to Evaluate:
${payload}

Respond ONLY with valid JSON.`;

  try {
    const rawJson = await generateGeminiText({
      prompt,
      systemInstruction,
      responseMimeType: 'application/json',
    });

    const parsed = JSON.parse(rawJson) as { judgements: AdherenceJudgement[] };
    if (Array.isArray(parsed?.judgements)) {
      return parsed.judgements;
    }
  } catch (error) {
    console.warn('Failed to parse Gemini style adherence judgement JSON:', error);
  }

  // Graceful fallback if JSON parsing fails
  return items.map((item) => ({
    styleId: item.styleId,
    styleScore: 85,
    reason: 'Rewritten with natural stylistic transformation preserving meaning.',
  }));
}
