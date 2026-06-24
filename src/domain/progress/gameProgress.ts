import { calculateLevelStars, type LevelCompletionStats, type LevelStars } from './levelStars';
import { discoverProduct } from './productCollection';
import { EMPTY_PROGRESS, type GameProgress } from './types';

const STORAGE_KEY = 'fillwords-phc-progress-v1';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const parseInfiniteWaveCompleted = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
};

const parseSessionFoundWords = (value: unknown): Record<string, string[]> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, string[]> = {};
  for (const [key, found] of Object.entries(value)) {
    if (typeof key === 'string' && isStringArray(found)) {
      result[key] = [...new Set(found)];
    }
  }
  return result;
};

const parseStringRecord = (value: unknown): Record<string, string> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof key === 'string' && typeof entry === 'string') {
      result[key] = entry;
    }
  }
  return result;
};

const parseBoolRecord = (value: unknown): Record<string, boolean> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof key === 'string' && entry === true) {
      result[key] = true;
    }
  }
  return result;
};

const parseDailyCompletedDates = (value: unknown): string[] => {
  if (!isStringArray(value)) {
    return [];
  }
  return [...new Set(value)].filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
};

const parseLevelStars = (value: unknown): Record<string, LevelStars> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, LevelStars> = {};
  for (const [key, stars] of Object.entries(value)) {
    if (typeof key === 'string' && (stars === 1 || stars === 2 || stars === 3)) {
      result[key] = stars;
    }
  }
  return result;
};

const parseLevelBestTimes = (value: unknown): Record<string, number> => {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const result: Record<string, number> = {};
  for (const [key, time] of Object.entries(value)) {
    if (typeof key === 'string' && typeof time === 'number' && Number.isFinite(time) && time >= 0) {
      result[key] = Math.floor(time);
    }
  }
  return result;
};

const parseDiscoveredProducts = (value: unknown): string[] => {
  if (!isStringArray(value)) {
    return [];
  }
  return [...new Set(value)];
};

const parseProgress = (raw: string | null): GameProgress => {
  if (!raw) return { ...EMPTY_PROGRESS };

  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data === 'object' &&
      data !== null &&
      'completedLevelIds' in data &&
      isStringArray((data as GameProgress).completedLevelIds)
    ) {
      return {
        completedLevelIds: [...new Set((data as GameProgress).completedLevelIds)],
        infiniteWaveCompleted: parseInfiniteWaveCompleted(
          (data as GameProgress).infiniteWaveCompleted,
        ),
        sessionFoundWords: parseSessionFoundWords((data as GameProgress).sessionFoundWords),
        sessionHintsUsed: parseBoolRecord((data as GameProgress).sessionHintsUsed),
        sessionHintCells: parseStringRecord((data as GameProgress).sessionHintCells),
        dailyCompletedDates: parseDailyCompletedDates((data as GameProgress).dailyCompletedDates),
        levelStars: parseLevelStars((data as GameProgress).levelStars),
        levelBestTimesMs: parseLevelBestTimes((data as GameProgress).levelBestTimesMs),
        discoveredProducts: parseDiscoveredProducts((data as GameProgress).discoveredProducts),
      };
    }
  } catch {
    // ignore corrupt data
  }

  return { ...EMPTY_PROGRESS };
};

export const loadProgress = (storage: Storage = localStorage): GameProgress =>
  parseProgress(storage.getItem(STORAGE_KEY));

export const saveProgress = (progress: GameProgress, storage: Storage = localStorage): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const getSessionFoundWords = (
  progress: GameProgress,
  sessionKey: string,
): string[] => progress.sessionFoundWords[sessionKey] ?? [];

export const setSessionFoundWords = (
  progress: GameProgress,
  sessionKey: string,
  foundWordIds: readonly string[],
): GameProgress => {
  const unique = [...new Set(foundWordIds)];
  if (unique.length === 0) {
    return clearSession(progress, sessionKey);
  }

  const current = progress.sessionFoundWords[sessionKey];
  if (current && current.length === unique.length && current.every((id, i) => id === unique[i])) {
    return progress;
  }

  return {
    ...progress,
    sessionFoundWords: { ...progress.sessionFoundWords, [sessionKey]: unique },
  };
};

export const clearSession = (progress: GameProgress, sessionKey: string): GameProgress => {
  const hasFound = sessionKey in progress.sessionFoundWords;
  const hasHint =
    progress.sessionHintsUsed[sessionKey] === true || sessionKey in progress.sessionHintCells;

  if (!hasFound && !hasHint) {
    return progress;
  }

  const { [sessionKey]: _found, ...sessionFoundWords } = progress.sessionFoundWords;
  const { [sessionKey]: _hintUsed, ...sessionHintsUsed } = progress.sessionHintsUsed;
  const { [sessionKey]: _hintCell, ...sessionHintCells } = progress.sessionHintCells;

  return {
    ...progress,
    sessionFoundWords,
    sessionHintsUsed,
    sessionHintCells,
  };
};

export const isHintUsed = (progress: GameProgress, sessionKey: string): boolean =>
  progress.sessionHintsUsed[sessionKey] === true;

export const getHintCellKey = (progress: GameProgress, sessionKey: string): string | undefined =>
  progress.sessionHintCells[sessionKey];

export const markHintUsed = (
  progress: GameProgress,
  sessionKey: string,
  cellKey: string,
): GameProgress => {
  if (progress.sessionHintsUsed[sessionKey] && progress.sessionHintCells[sessionKey] === cellKey) {
    return progress;
  }

  return {
    ...progress,
    sessionHintsUsed: { ...progress.sessionHintsUsed, [sessionKey]: true },
    sessionHintCells: { ...progress.sessionHintCells, [sessionKey]: cellKey },
  };
};

export const isDailyComplete = (progress: GameProgress, dateKey: string): boolean =>
  progress.dailyCompletedDates.includes(dateKey);

export const markDailyComplete = (progress: GameProgress, dateKey: string): GameProgress => {
  const cleared = clearSession(progress, `daily-${dateKey}`);

  if (cleared.dailyCompletedDates.includes(dateKey)) {
    return cleared;
  }

  return {
    ...cleared,
    dailyCompletedDates: [...cleared.dailyCompletedDates, dateKey],
  };
};

export const getLevelStars = (progress: GameProgress, puzzleId: string): LevelStars | undefined =>
  progress.levelStars[puzzleId];

export const getLevelBestTimeMs = (progress: GameProgress, puzzleId: string): number | undefined =>
  progress.levelBestTimesMs[puzzleId];

export const totalStarsEarned = (
  progress: GameProgress,
  orderedLevelIds: readonly string[],
): number =>
  orderedLevelIds.reduce((sum, levelId) => sum + (progress.levelStars[levelId] ?? 0), 0);

export const maxStarsAvailable = (orderedLevelIds: readonly string[]): number =>
  orderedLevelIds.length * 3;

export const recordProductDiscovery = (
  progress: GameProgress,
  productName: string,
): GameProgress => {
  const discoveredProducts = discoverProduct(progress.discoveredProducts, productName);
  if (discoveredProducts.length === progress.discoveredProducts.length) {
    return progress;
  }
  return { ...progress, discoveredProducts };
};

export const recordCampaignLevelCompletion = (
  progress: GameProgress,
  puzzleId: string,
  stats: LevelCompletionStats,
): GameProgress => {
  const stars = calculateLevelStars(stats);
  const cleared = clearSession(progress, puzzleId);

  const previousStars = cleared.levelStars[puzzleId] ?? 0;
  const nextStars = Math.max(previousStars, stars) as LevelStars;

  const previousBest = cleared.levelBestTimesMs[puzzleId];
  const nextBest =
    previousBest === undefined ? stats.elapsedMs : Math.min(previousBest, stats.elapsedMs);

  const withCompletion = cleared.completedLevelIds.includes(puzzleId)
    ? cleared
    : {
        ...cleared,
        completedLevelIds: [...cleared.completedLevelIds, puzzleId],
      };

  if (
    withCompletion.levelStars[puzzleId] === nextStars &&
    withCompletion.levelBestTimesMs[puzzleId] === nextBest &&
    withCompletion.completedLevelIds.length === cleared.completedLevelIds.length &&
    cleared.completedLevelIds.includes(puzzleId)
  ) {
    return withCompletion;
  }

  return {
    ...withCompletion,
    levelStars: { ...withCompletion.levelStars, [puzzleId]: nextStars },
    levelBestTimesMs: { ...withCompletion.levelBestTimesMs, [puzzleId]: nextBest },
  };
};

export const markLevelComplete = (
  progress: GameProgress,
  puzzleId: string,
): GameProgress => {
  const cleared = clearSession(progress, puzzleId);

  if (cleared.completedLevelIds.includes(puzzleId)) {
    return cleared;
  }

  return {
    ...cleared,
    completedLevelIds: [...cleared.completedLevelIds, puzzleId],
  };
};

export const markInfiniteWaveComplete = (
  progress: GameProgress,
  wave: number,
): GameProgress => {
  const cleared = clearSession(progress, `infinite-${wave}`);

  if (wave <= cleared.infiniteWaveCompleted) {
    return cleared;
  }

  return {
    ...cleared,
    infiniteWaveCompleted: wave,
  };
};

export const isLevelComplete = (progress: GameProgress, puzzleId: string): boolean =>
  progress.completedLevelIds.includes(puzzleId);

export const isCampaignComplete = (
  progress: GameProgress,
  orderedLevelIds: readonly string[],
): boolean => orderedLevelIds.every((levelId) => isLevelComplete(progress, levelId));

/** Уровень 1 всегда открыт; уровень N — после прохождения N−1. */
export const isLevelUnlocked = (
  levelIndex: number,
  progress: GameProgress,
  orderedLevelIds: readonly string[],
): boolean => {
  if (levelIndex <= 0) return true;

  const previousLevelId = orderedLevelIds[levelIndex - 1];
  return previousLevelId !== undefined && isLevelComplete(progress, previousLevelId);
};

export const isInfiniteUnlocked = (
  progress: GameProgress,
  orderedLevelIds: readonly string[],
): boolean => isCampaignComplete(progress, orderedLevelIds);

export const isInfiniteWaveUnlocked = (
  wave: number,
  progress: GameProgress,
  orderedLevelIds: readonly string[],
): boolean => {
  if (!isInfiniteUnlocked(progress, orderedLevelIds)) {
    return false;
  }
  if (wave <= 1) {
    return true;
  }
  return progress.infiniteWaveCompleted >= wave - 1;
};

export const getNextInfiniteWave = (progress: GameProgress): number =>
  progress.infiniteWaveCompleted + 1;

export const completedCount = (progress: GameProgress): number =>
  progress.completedLevelIds.length;

export const findContinueLevelId = (
  orderedLevelIds: readonly string[],
  progress: GameProgress,
): string | undefined => {
  for (const [index, levelId] of orderedLevelIds.entries()) {
    if (isLevelComplete(progress, levelId)) continue;
    if (isLevelUnlocked(index, progress, orderedLevelIds)) return levelId;
    return undefined;
  }

  return undefined;
};
