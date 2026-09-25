import { describe, expect, it } from 'vitest';
import {
  clearSession,
  findContinueLevelId,
  getHintCellKey,
  getSessionFoundWords,
  isCampaignComplete,
  isDailyComplete,
  isHintUsed,
  isInfiniteUnlocked,
  isInfiniteWaveUnlocked,
  isLevelComplete,
  isLevelUnlocked,
  markDailyComplete,
  markHintUsed,
  markInfiniteWaveComplete,
  markLevelComplete,
  recordCampaignLevelCompletion,
  recordProductDiscovery,
  setSessionFoundWords,
} from './gameProgress';
import { EMPTY_PROGRESS, type GameProgress } from './types';
import { threeStarTimeLimitMs } from './levelStars';

const LEVEL_IDS = ['level-1', 'level-2', 'level-3'] as const;

describe('markLevelComplete', () => {
  it('adds a level id once', () => {
    const next = markLevelComplete(EMPTY_PROGRESS, 'level-1');
    expect(next.completedLevelIds).toEqual(['level-1']);

    const again = markLevelComplete(next, 'level-1');
    expect(again.completedLevelIds).toEqual(['level-1']);
  });
});

describe('isLevelUnlocked', () => {
  it('unlocks only the next level in order', () => {
    let progress = EMPTY_PROGRESS;

    expect(isLevelUnlocked(0, progress, LEVEL_IDS)).toBe(true);
    expect(isLevelUnlocked(1, progress, LEVEL_IDS)).toBe(false);
    expect(isLevelUnlocked(2, progress, LEVEL_IDS)).toBe(false);

    progress = markLevelComplete(progress, 'level-1');
    expect(isLevelUnlocked(1, progress, LEVEL_IDS)).toBe(true);
    expect(isLevelUnlocked(2, progress, LEVEL_IDS)).toBe(false);

    progress = markLevelComplete(progress, 'level-2');
    expect(isLevelUnlocked(2, progress, LEVEL_IDS)).toBe(true);
  });
});

describe('findContinueLevelId', () => {
  it('returns the first incomplete unlocked level', () => {
    expect(findContinueLevelId(LEVEL_IDS, EMPTY_PROGRESS)).toBe('level-1');

    const afterOne = markLevelComplete(EMPTY_PROGRESS, 'level-1');
    expect(findContinueLevelId(LEVEL_IDS, afterOne)).toBe('level-2');

    const allDone = markLevelComplete(
      markLevelComplete(afterOne, 'level-2'),
      'level-3',
    );
    expect(findContinueLevelId(LEVEL_IDS, allDone)).toBeUndefined();
  });
});

describe('isLevelComplete', () => {
  it('tracks completed levels', () => {
    const progress = markLevelComplete(EMPTY_PROGRESS, 'level-2');
    expect(isLevelComplete(progress, 'level-2')).toBe(true);
    expect(isLevelComplete(progress, 'level-1')).toBe(false);
  });
});

describe('infinite mode progress', () => {
  const allCampaignDone = (): GameProgress =>
    LEVEL_IDS.reduce((progress, id) => markLevelComplete(progress, id), EMPTY_PROGRESS);

  it('unlocks infinite only after campaign', () => {
    expect(isInfiniteUnlocked(EMPTY_PROGRESS, LEVEL_IDS)).toBe(false);
    expect(isInfiniteUnlocked(allCampaignDone(), LEVEL_IDS)).toBe(true);
  });

  it('unlocks waves in order', () => {
    const campaign = allCampaignDone();
    expect(isInfiniteWaveUnlocked(1, campaign, LEVEL_IDS)).toBe(true);
    expect(isInfiniteWaveUnlocked(2, campaign, LEVEL_IDS)).toBe(false);

    const afterWave1 = markInfiniteWaveComplete(campaign, 1);
    expect(isInfiniteWaveUnlocked(2, afterWave1, LEVEL_IDS)).toBe(true);
  });

  it('detects campaign completion', () => {
    expect(isCampaignComplete(EMPTY_PROGRESS, LEVEL_IDS)).toBe(false);
    expect(isCampaignComplete(allCampaignDone(), LEVEL_IDS)).toBe(true);
  });
});

describe('session progress', () => {
  it('stores and clears found words for a session', () => {
    let progress = setSessionFoundWords(EMPTY_PROGRESS, 'level-1', ['w1', 'w2']);
    expect(getSessionFoundWords(progress, 'level-1')).toEqual(['w1', 'w2']);

    progress = setSessionFoundWords(progress, 'level-1', ['w1', 'w2', 'w3']);
    expect(getSessionFoundWords(progress, 'level-1')).toEqual(['w1', 'w2', 'w3']);

    progress = clearSession(progress, 'level-1');
    expect(getSessionFoundWords(progress, 'level-1')).toEqual([]);
  });

  it('clears session when level is marked complete', () => {
    const withSession = setSessionFoundWords(EMPTY_PROGRESS, 'level-1', ['w1']);
    const completed = markLevelComplete(withSession, 'level-1');
    expect(getSessionFoundWords(completed, 'level-1')).toEqual([]);
    expect(completed.completedLevelIds).toEqual(['level-1']);
  });

  it('clears infinite session when wave is completed', () => {
    const withSession = setSessionFoundWords(EMPTY_PROGRESS, 'infinite-3', ['w1']);
    const completed = markInfiniteWaveComplete(withSession, 3);
    expect(getSessionFoundWords(completed, 'infinite-3')).toEqual([]);
    expect(completed.infiniteWaveCompleted).toBe(3);
  });
});

describe('hints progress', () => {
  it('stores and clears hint state with session', () => {
    let progress = markHintUsed(EMPTY_PROGRESS, 'level-1', '1:2');
    expect(isHintUsed(progress, 'level-1')).toBe(true);
    expect(getHintCellKey(progress, 'level-1')).toBe('1:2');

    progress = clearSession(progress, 'level-1');
    expect(isHintUsed(progress, 'level-1')).toBe(false);
    expect(getHintCellKey(progress, 'level-1')).toBeUndefined();
  });
});

describe('daily challenge progress', () => {
  it('marks a date complete once and clears session', () => {
    const withSession = setSessionFoundWords(EMPTY_PROGRESS, 'daily-2026-06-24', ['w1']);
    const completed = markDailyComplete(withSession, '2026-06-24');
    expect(isDailyComplete(completed, '2026-06-24')).toBe(true);
    expect(getSessionFoundWords(completed, 'daily-2026-06-24')).toEqual([]);

    const again = markDailyComplete(completed, '2026-06-24');
    expect(again.dailyCompletedDates).toEqual(['2026-06-24']);
  });
});

describe('campaign stars and collection', () => {
  it('records stars and best time, keeping the best result', () => {
    const first = recordCampaignLevelCompletion(EMPTY_PROGRESS, 'level-1', {
      gridSize: 4,
      usedHint: true,
      elapsedMs: 120_000,
    });
    expect(first.levelStars['level-1']).toBe(1);
    expect(first.levelBestTimesMs['level-1']).toBe(120_000);

    const improved = recordCampaignLevelCompletion(first, 'level-1', {
      gridSize: 4,
      usedHint: false,
      elapsedMs: threeStarTimeLimitMs(4) + 1,
    });
    expect(improved.levelStars['level-1']).toBe(2);
    expect(improved.levelBestTimesMs['level-1']).toBe(120_000);
    expect(improved.completedLevelIds).toEqual(['level-1']);
  });

  it('tracks discovered products without duplicates', () => {
    const once = recordProductDiscovery(EMPTY_PROGRESS, 'ЭРИУС');
    const twice = recordProductDiscovery(once, 'ЭРИУС');
    expect(twice.discoveredProducts).toEqual(['ЭРИУС']);
  });
});
