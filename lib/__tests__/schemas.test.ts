import { describe, it, expect } from 'vitest';
import {
  rewriteRequestSchema,
  scoreRequestSchema,
  profileRequestSchema,
  styleIdSchema,
  intensitySchema,
} from '../schemas';

describe('Zod API Schemas Validation', () => {
  describe('rewriteRequestSchema', () => {
    it('accepts valid rewrite requests', () => {
      const payload = {
        text: 'This is a test paragraph.',
        styles: ['formal', 'casual'],
        intensity: 'moderate',
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects empty input text', () => {
      const payload = {
        text: '',
        styles: ['formal'],
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be empty');
      }
    });

    it('rejects text exceeding 3000 characters', () => {
      const longText = 'a'.repeat(3001);
      const payload = {
        text: longText,
        styles: ['formal'],
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exceeds maximum allowed length');
      }
    });

    it('rejects requests with 0 styles', () => {
      const payload = {
        text: 'Hello world',
        styles: [],
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects requests with more than 6 styles', () => {
      const payload = {
        text: 'Hello world',
        styles: ['formal', 'casual', 'gen-z', 'funny', 'storyteller', 'concise', 'hinglish'],
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 6 styles');
      }
    });

    it('defaults intensity to moderate if omitted', () => {
      const payload = {
        text: 'Valid text sample',
        styles: ['formal'],
      };
      const result = rewriteRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.intensity).toBe('moderate');
      }
    });
  });

  describe('styleIdSchema & intensitySchema', () => {
    it('validates styleId and intensity values', () => {
      expect(styleIdSchema.safeParse('formal').success).toBe(true);
      expect(styleIdSchema.safeParse('invalid-style').success).toBe(false);
      expect(intensitySchema.safeParse('subtle').success).toBe(true);
      expect(intensitySchema.safeParse('extreme').success).toBe(false);
    });
  });

  describe('scoreRequestSchema', () => {
    it('validates proper score request payload', () => {
      const payload = {
        original: 'Original text.',
        results: [
          { styleId: 'formal', text: 'Formal text.' },
          { styleId: 'casual', text: 'Casual text.' },
        ],
      };
      const result = scoreRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects scoring request with empty results array', () => {
      const payload = {
        original: 'Original text.',
        results: [],
      };
      const result = scoreRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('profileRequestSchema', () => {
    it('accepts 3 valid writing samples', () => {
      const payload = {
        samples: [
          'First valid sample paragraph of text.',
          'Second valid sample paragraph of text.',
          'Third valid sample paragraph of text.',
        ],
      };
      const result = profileRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects fewer than 3 samples', () => {
      const payload = {
        samples: ['Sample one is here.', 'Sample two is here.'],
      };
      const result = profileRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects more than 5 samples', () => {
      const payload = {
        samples: [
          'Sample one is long enough.',
          'Sample two is long enough.',
          'Sample three is long enough.',
          'Sample four is long enough.',
          'Sample five is long enough.',
          'Sample six is long enough.',
        ],
      };
      const result = profileRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects sample with fewer than 10 characters', () => {
      const payload = {
        samples: ['Short', 'A second valid sample text.', 'A third valid sample text.'],
      };
      const result = profileRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
