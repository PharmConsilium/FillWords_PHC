import { pickWordsForGrid } from './infiniteMode';
import { generatePuzzle } from './generatePuzzle';
import type { PuzzleDefinition } from './types';

export const dailyDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const dailyChallengeSeed = (date: Date = new Date()): number => {
  const key = dailyDateKey(date).replace(/-/g, '');
  return Number.parseInt(key, 10);
};

export const dailyChallengeTitle = (date: Date = new Date()): string => {
  const formatted = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  return `Челлендж · ${formatted}`;
};

/** Размер сетки челленджа дня: 6×6 в будни, 7×7 в выходные. */
export const dailyGridSize = (date: Date = new Date()): number => {
  const day = date.getDay();
  return day === 0 || day === 6 ? 7 : 6;
};

export const createDailyPuzzle = (date: Date = new Date()): PuzzleDefinition => {
  const dateKey = dailyDateKey(date);
  const size = dailyGridSize(date);
  const seed = dailyChallengeSeed(date);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const words = pickWordsForGrid(size, seed * 100 + attempt);
    try {
      return generatePuzzle({
        id: `daily-${dateKey}`,
        title: dailyChallengeTitle(date),
        words,
        size,
        seed: seed + attempt,
      });
    } catch {
      // другой набор слов
    }
  }

  throw new Error(`Не удалось сгенерировать челлендж на ${dateKey}`);
};

export const dailySessionKey = (date: Date = new Date()): string => `daily-${dailyDateKey(date)}`;
