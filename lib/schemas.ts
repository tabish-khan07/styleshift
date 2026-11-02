import { z } from 'zod';
import { APP_CONFIG } from './config';

export const styleIdSchema = z.enum([
  'formal',
  'casual',
  'gen-z',
  'shakespearean',
  'linkedin',
  'funny',
  'hinglish',
  'storyteller',
  'concise',
  'my-voice',
]);

export const intensitySchema = z.enum(['subtle', 'moderate', 'heavy']);

export const voiceProfileSchema = z.object({
  avgSentenceLength: z.string().default('Medium (15-20 words)'),
  vocabularyLevel: z.string().default('Conversational / Professional'),
  tone: z.string().default('Warm and analytical'),
  formality: z.string().default('Balanced'),
  favoritePhrases: z.array(z.string()).default([]),
  punctuationHabits: z.string().default('Standard with occasional em-dashes'),
  doRules: z.array(z.string()).default([]),
  dontRules: z.array(z.string()).default([]),
  summary: z.string().default('Dynamic user voice profile'),
  centroid: z.array(z.number()).optional(),
});

export const rewriteRequestSchema = z.object({
  text: z
    .string()
    .min(1, 'Input text cannot be empty.')
    .max(
      APP_CONFIG.limits.maxTextLength,
      `Text exceeds maximum allowed length of ${APP_CONFIG.limits.maxTextLength} characters.`
    ),
  styles: z
    .array(styleIdSchema)
    .min(1, 'Please select at least one writing style.')
    .max(
      APP_CONFIG.limits.maxStylesPerRequest,
      `You can select at most ${APP_CONFIG.limits.maxStylesPerRequest} styles at once.`
    ),
  intensity: intensitySchema.default('moderate'),
  voiceProfile: voiceProfileSchema.optional(),
});

export const scoreItemSchema = z.object({
  styleId: styleIdSchema,
  text: z.string().min(1, 'Text cannot be empty for scoring.'),
});

export const scoreRequestSchema = z.object({
  original: z.string().min(1, 'Original reference text is required.'),
  results: z.array(scoreItemSchema).min(1, 'At least one rewrite result is required for scoring.'),
  voiceCentroid: z.array(z.number()).optional(),
});

export const profileRequestSchema = z.object({
  samples: z
    .array(z.string().min(10, 'Each sample must contain at least 10 characters.'))
    .min(3, 'Please provide at least 3 writing samples.')
    .max(5, 'Maximum of 5 writing samples allowed.'),
});
