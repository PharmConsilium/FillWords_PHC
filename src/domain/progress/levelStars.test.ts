import { describe, expect, it } from 'vitest';
import { calculateLevelStars, threeStarTimeLimitMs } from './levelStars';

describe('calculateLevelStars', () => {
  it('gives 1 star when hint was used', () => {
    expect(
      calculateLevelStars({ gridSize: 6, usedHint: true, elapsedMs: 30_000 }),
    ).toBe(1);
  });

  it('gives 2 stars without hint but over time limit', () => {
    expect(
      calculateLevelStars({
        gridSize: 4,
        usedHint: false,
        elapsedMs: threeStarTimeLimitMs(4) + 1,
      }),
    ).toBe(2);
  });

  it('gives 3 stars without hint within time limit', () => {
    expect(
      calculateLevelStars({
        gridSize: 4,
        usedHint: false,
        elapsedMs: threeStarTimeLimitMs(4),
      }),
    ).toBe(3);
  });
});
