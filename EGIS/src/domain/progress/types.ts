export type LevelStars = 1 | 2 | 3;

export type GameProgress = {
  completedLevelIds: string[];
  /** Номер последней пройденной волны бесконечного режима (0 — ещё не играли). */
  infiniteWaveCompleted: number;
  /** Найденные слова в незавершённых сессиях: ключ — puzzleId, infinite-N или daily-YYYY-MM-DD. */
  sessionFoundWords: Record<string, string[]>;
  /** Использована ли подсказка в сессии. */
  sessionHintsUsed: Record<string, boolean>;
  /** Подсвеченная ячейка подсказки (row:col). */
  sessionHintCells: Record<string, string>;
  /** Даты (YYYY-MM-DD), когда пройден ежедневный челлендж. */
  dailyCompletedDates: string[];
  /** Звёзды за пройденные уровни кампании (1–3). */
  levelStars: Record<string, LevelStars>;
  /** Лучшее время прохождения уровня кампании (мс). */
  levelBestTimesMs: Record<string, number>;
  /** Найденные в игре названия препаратов Bayer. */
  discoveredProducts: string[];
};

export const EMPTY_PROGRESS: GameProgress = {
  completedLevelIds: [],
  infiniteWaveCompleted: 0,
  sessionFoundWords: {},
  sessionHintsUsed: {},
  sessionHintCells: {},
  dailyCompletedDates: [],
  levelStars: {},
  levelBestTimesMs: {},
  discoveredProducts: [],
};
