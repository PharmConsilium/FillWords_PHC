export type LevelStars = 1 | 2 | 3;

export type LevelCompletionStats = {
  gridSize: number;
  usedHint: boolean;
  elapsedMs: number;
};

/** Лимит времени для 3 звёзд (мс) по размеру сетки. */
export const threeStarTimeLimitMs = (gridSize: number): number => {
  const limits: Record<number, number> = {
    4: 3 * 60_000,
    5: 4 * 60_000,
    6: 5 * 60_000,
    7: 6 * 60_000,
    8: 7 * 60_000,
    9: 8 * 60_000,
    10: 9 * 60_000,
    11: 10 * 60_000,
    12: 12 * 60_000,
  };
  return limits[gridSize] ?? gridSize * 60_000;
};

export const calculateLevelStars = (stats: LevelCompletionStats): LevelStars => {
  if (!stats.usedHint) {
    if (stats.elapsedMs <= threeStarTimeLimitMs(stats.gridSize)) {
      return 3;
    }
    return 2;
  }
  return 1;
};

export const formatElapsed = (elapsedMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const starsLabel = (stars: LevelStars): string => '★'.repeat(stars) + '☆'.repeat(3 - stars);
