import { useCallback, useMemo, useState } from 'react';
import {
  clearSession,
  completedCount,
  findContinueLevelId,
  getHintCellKey,
  getLevelBestTimeMs,
  getLevelStars,
  getNextInfiniteWave,
  getSessionFoundWords,
  isCampaignComplete,
  isDailyComplete,
  isHintUsed,
  isInfiniteUnlocked,
  isInfiniteWaveUnlocked,
  isLevelComplete,
  isLevelUnlocked,
  loadProgress,
  markDailyComplete,
  markHintUsed,
  markInfiniteWaveComplete,
  markLevelComplete,
  maxStarsAvailable,
  recordCampaignLevelCompletion,
  recordProductDiscovery,
  saveProgress,
  setSessionFoundWords,
  totalStarsEarned,
} from '../../domain/progress/gameProgress';
import { calculateDailyStreak } from '../../domain/progress/dailyStreak';
import type { LevelCompletionStats } from '../../domain/progress/levelStars';
import { collectionProgress } from '../../domain/progress/productCollection';
import { dailyDateKey } from '../../domain/puzzle/dailyChallenge';
import type { GameProgress } from '../../domain/progress/types';
import { puzzles } from '../../domain/puzzle/puzzles';
import type { PuzzleDefinition } from '../../domain/puzzle/types';

type UseGameProgressOptions = {
  puzzles?: readonly PuzzleDefinition[];
  storageKey?: string;
  productCatalog?: readonly string[];
};

export const useGameProgress = ({
  puzzles: brandPuzzles = puzzles,
  storageKey,
  productCatalog,
}: UseGameProgressOptions = {}) => {
  const orderedLevelIds = useMemo(
    () => brandPuzzles.map((puzzle) => puzzle.id),
    [brandPuzzles],
  );
  const progressStorageKey = storageKey;
  const [progress, setProgress] = useState<GameProgress>(() =>
    loadProgress(localStorage, progressStorageKey),
  );

  const markComplete = useCallback((puzzleId: string) => {
    setProgress((prev) => {
      const next = markLevelComplete(prev, puzzleId);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const recordCampaignCompletion = useCallback(
    (puzzleId: string, stats: LevelCompletionStats) => {
      setProgress((prev) => {
        const next = recordCampaignLevelCompletion(prev, puzzleId, stats);
        if (next === prev) return prev;
        saveProgress(next, localStorage, progressStorageKey);
        return next;
      });
    },
    [progressStorageKey],
  );

  const discoverProduct = useCallback((productName: string) => {
    setProgress((prev) => {
      const next = recordProductDiscovery(prev, productName, productCatalog);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [productCatalog, progressStorageKey]);

  const markInfiniteComplete = useCallback((wave: number) => {
    setProgress((prev) => {
      const next = markInfiniteWaveComplete(prev, wave);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const saveSession = useCallback((sessionKey: string, foundWordIds: readonly string[]) => {
    setProgress((prev) => {
      const next = setSessionFoundWords(prev, sessionKey, foundWordIds);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const getSavedFoundWords = useCallback(
    (sessionKey: string) => getSessionFoundWords(progress, sessionKey),
    [progress],
  );

  const resetSession = useCallback((sessionKey: string) => {
    setProgress((prev) => {
      const next = clearSession(prev, sessionKey);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const useHint = useCallback((sessionKey: string, cellKey: string) => {
    setProgress((prev) => {
      const next = markHintUsed(prev, sessionKey, cellKey);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const markDailyDone = useCallback((dateKey: string) => {
    setProgress((prev) => {
      const next = markDailyComplete(prev, dateKey);
      if (next === prev) return prev;
      saveProgress(next, localStorage, progressStorageKey);
      return next;
    });
  }, [progressStorageKey]);

  const todayKey = dailyDateKey();
  const totalLevels = orderedLevelIds.length;
  const completed = completedCount(progress);
  const continueLevelId = findContinueLevelId(orderedLevelIds, progress);
  const campaignComplete = isCampaignComplete(progress, orderedLevelIds);
  const infiniteUnlocked = isInfiniteUnlocked(progress, orderedLevelIds);
  const infiniteWaveCompleted = progress.infiniteWaveCompleted;
  const nextInfiniteWave = getNextInfiniteWave(progress);
  const starsEarned = totalStarsEarned(progress, orderedLevelIds);
  const starsTotal = maxStarsAvailable(orderedLevelIds);
  const dailyStreak = calculateDailyStreak(progress.dailyCompletedDates);
  const productCollection = collectionProgress(progress.discoveredProducts, productCatalog);

  const helpers = useMemo(
    () => ({
      isComplete: (puzzleId: string) => isLevelComplete(progress, puzzleId),
      isUnlocked: (levelIndex: number) =>
        isLevelUnlocked(levelIndex, progress, orderedLevelIds),
      isInfiniteWaveUnlocked: (wave: number) =>
        isInfiniteWaveUnlocked(wave, progress, orderedLevelIds),
      isHintUsed: (sessionKey: string) => isHintUsed(progress, sessionKey),
      getHintCellKey: (sessionKey: string) => getHintCellKey(progress, sessionKey),
      isDailyComplete: (dateKey: string) => isDailyComplete(progress, dateKey),
      getLevelStars: (puzzleId: string) => getLevelStars(progress, puzzleId),
      getLevelBestTimeMs: (puzzleId: string) => getLevelBestTimeMs(progress, puzzleId),
    }),
    [orderedLevelIds, progress],
  );

  return {
    progress,
    markComplete,
    recordCampaignCompletion,
    discoverProduct,
    markInfiniteComplete,
    markDailyDone,
    saveSession,
    useHint,
    getSavedFoundWords,
    clearSession: resetSession,
    todayKey,
    isTodayDailyComplete: isDailyComplete(progress, todayKey),
    totalLevels,
    completed,
    continueLevelId,
    campaignComplete,
    infiniteUnlocked,
    infiniteWaveCompleted,
    nextInfiniteWave,
    starsEarned,
    starsTotal,
    dailyStreak,
    productCollection,
    discoveredProducts: progress.discoveredProducts,
    ...helpers,
  };
};
