import { describe, it, expect } from 'vitest';
import { POST as rewriteHandler } from '../../app/api/rewrite/route';
import { POST as scoreHandler } from '../../app/api/score/route';
import { POST as profileHandler } from '../../app/api/profile/route';
import { NextRequest } from 'next/server';

function createMockRequest(url: string, body: unknown, ip = '192.168.1.100'): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

describe('API Route Handlers Quality Scenarios', () => {
  describe('POST /api/rewrite', () => {
    it('rejects empty input text with 400 VALIDATION_ERROR', async () => {
      const req = createMockRequest('http://localhost:3000/api/rewrite', {
        text: '',
        styles: ['formal'],
      });
      const res = await rewriteHandler(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects input text exceeding 3000 characters', async () => {
      const longText = 'x'.repeat(3005);
      const req = createMockRequest('http://localhost:3000/api/rewrite', {
        text: longText,
        styles: ['formal'],
      });
      const res = await rewriteHandler(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects request with 0 styles', async () => {
      const req = createMockRequest('http://localhost:3000/api/rewrite', {
        text: 'Valid short paragraph.',
        styles: [],
      });
      const res = await rewriteHandler(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects request exceeding 6 styles', async () => {
      const req = createMockRequest('http://localhost:3000/api/rewrite', {
        text: 'Valid short paragraph.',
        styles: ['formal', 'casual', 'gen-z', 'funny', 'storyteller', 'concise', 'hinglish'],
      });
      const res = await rewriteHandler(req);
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('gracefully handles missing API key by returning card error rather than 500 crash', async () => {
      // In an environment where GEMINI_API_KEY is not set or invalid,
      // rewrite returns individual card error while preserving HTTP 200 contract
      const req = createMockRequest(
        'http://localhost:3000/api/rewrite',
        {
          text: 'The quarterly report is delayed.',
          styles: ['formal'],
          intensity: 'moderate',
        },
        '10.0.0.1'
      );

      const res = await rewriteHandler(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.results).toBeDefined();
      expect(data.results.length).toBe(1);
      expect(data.results[0].styleId).toBe('formal');
      // If no valid key in test environment, error field is populated on the card
      if (data.results[0].error) {
        expect(typeof data.results[0].error).toBe('string');
      }
    });

    it('enforces 10 requests per minute rate limit per IP', async () => {
      const testIp = '172.16.0.42';
      // Fire 10 requests
      for (let i = 0; i < 10; i++) {
        const req = createMockRequest(
          'http://localhost:3000/api/rewrite',
          { text: 'Sample text', styles: ['formal'] },
          testIp
        );
        await rewriteHandler(req);
      }

      // 11th request must receive 429 RATE_LIMIT_EXCEEDED
      const req11 = createMockRequest(
        'http://localhost:3000/api/rewrite',
        { text: 'Sample text', styles: ['formal'] },
        testIp
      );
      const res11 = await rewriteHandler(req11);
      const data11 = await res11.json();
      expect(res11.status).toBe(429);
      expect(data11.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('POST /api/score', () => {
    it('validates score payload requirements', async () => {
      const req = createMockRequest('http://localhost:3000/api/score', {
        original: '',
        results: [],
      });
      const res = await scoreHandler(req);
      expect(res.status).toBe(400);
    });

    it('returns empty scores array when provided with empty text items', async () => {
      const req = createMockRequest(
        'http://localhost:3000/api/score',
        {
          original: 'Reference text',
          results: [{ styleId: 'formal', text: '   ' }],
        },
        '10.0.0.2'
      );
      const res = await scoreHandler(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.scores).toEqual([]);
    });
  });

  describe('POST /api/profile', () => {
    it('validates minimum sample count of 3', async () => {
      const req = createMockRequest('http://localhost:3000/api/profile', {
        samples: ['Only one sample.'],
      });
      const res = await profileHandler(req);
      expect(res.status).toBe(400);
    });
  });
});
