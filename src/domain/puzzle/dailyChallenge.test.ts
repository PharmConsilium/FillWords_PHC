import { describe, expect, it } from 'vitest';
import {
  createDailyPuzzle,
  dailyChallengeSeed,
  dailyDateKey,
  dailyGridSize,
  dailySessionKey,
} from './dailyChallenge';

describe('dailyChallenge', () => {
  it('uses a stable date key and seed', () => {
    const date = new Date(2026, 5, 24);
    expect(dailyDateKey(date)).toBe('2026-06-24');
    expect(dailyChallengeSeed(date)).toBe(20260624);
    expect(dailySessionKey(date)).toBe('daily-2026-06-24');
  });

  it('uses a larger grid on weekends', () => {
    expect(dailyGridSize(new Date(2026, 5, 24))).toBe(6); // Wednesday
    expect(dailyGridSize(new Date(2026, 5, 27))).toBe(7); // Saturday
  });

  it('generates the same puzzle for the same date', () => {
    const date = new Date(2026, 0, 15);
    const first = createDailyPuzzle(date);
    const second = createDailyPuzzle(date);
    expect(first.letters).toEqual(second.letters);
    expect(first.words.map((word) => word.text)).toEqual(second.words.map((word) => word.text));
  });
});
