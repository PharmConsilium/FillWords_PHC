import { describe, expect, it } from 'vitest';
import { calculateDailyStreak, longestDailyStreak } from './dailyStreak';

describe('calculateDailyStreak', () => {
  it('returns 0 with no completions', () => {
    expect(calculateDailyStreak([], new Date(2026, 5, 24))).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const today = new Date(2026, 5, 24);
    expect(
      calculateDailyStreak(['2026-06-22', '2026-06-23', '2026-06-24'], today),
    ).toBe(3);
  });

  it('counts from yesterday if today is not done yet', () => {
    const today = new Date(2026, 5, 24);
    expect(calculateDailyStreak(['2026-06-22', '2026-06-23'], today)).toBe(2);
  });

  it('resets after a missed day', () => {
    const today = new Date(2026, 5, 24);
    expect(calculateDailyStreak(['2026-06-20', '2026-06-24'], today)).toBe(1);
  });
});

describe('longestDailyStreak', () => {
  it('finds the longest run', () => {
    expect(longestDailyStreak(['2026-06-01', '2026-06-02', '2026-06-05', '2026-06-06'])).toBe(2);
  });
});
