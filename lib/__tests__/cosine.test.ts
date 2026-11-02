import { describe, it, expect } from 'vitest';
import {
  calculateCosineSimilarity,
  mapCosineToMeaningScore,
  calculateCentroid,
} from '../scoring';

describe('Cosine Similarity & Embeddings Math', () => {
  it('returns 1 for identical vectors', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 2, 3, 4, 5];
    expect(calculateCosineSimilarity(a, b)).toBeCloseTo(1, 5);
  });

  it('returns -1 for opposite vectors', () => {
    const a = [1, 2, 3];
    const b = [-1, -2, -3];
    expect(calculateCosineSimilarity(a, b)).toBeCloseTo(-1, 5);
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(calculateCosineSimilarity(a, b)).toBeCloseTo(0, 5);
  });

  it('handles zero vectors safely without division by zero', () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(calculateCosineSimilarity(a, b)).toBe(0);
  });

  it('handles empty or dimension-mismatched vectors gracefully', () => {
    expect(calculateCosineSimilarity([], [1, 2])).toBe(0);
    expect(calculateCosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it('maps cosine similarity to intuitive 0-100 meaning score correctly', () => {
    expect(mapCosineToMeaningScore(1.0)).toBe(100);
    expect(mapCosineToMeaningScore(0.999)).toBe(100);
    expect(mapCosineToMeaningScore(0)).toBe(0);
    expect(mapCosineToMeaningScore(-0.5)).toBe(0);

    const highSim = mapCosineToMeaningScore(0.95);
    expect(highSim).toBeGreaterThanOrEqual(90);

    const moderateSim = mapCosineToMeaningScore(0.75);
    expect(moderateSim).toBeGreaterThanOrEqual(50);
    expect(moderateSim).toBeLessThan(90);
  });

  it('calculates the centroid (mean) across multiple embedding vectors', () => {
    const v1 = [2, 4, 6];
    const v2 = [4, 6, 8];
    const centroid = calculateCentroid([v1, v2]);
    expect(centroid).toEqual([3, 5, 7]);
  });

  it('returns empty array when centroid is given no vectors', () => {
    expect(calculateCentroid([])).toEqual([]);
  });
});
