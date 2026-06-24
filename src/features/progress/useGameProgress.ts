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

const ORDERED_LEVEL_IDS = puzzles.map((puzzle) => puzzle.id);

export const useGameProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());

  const markComplete = useCallback((puzzleId: string) => {
    setProgress((prev) => {
      const next = markLevelComplete(prev, puzzleId);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const recordCampaignCompletion = useCallback(
    (puzzleId: string, stats: LevelCompletionStats) => {
      setProgress((prev) => {
        const next = recordCampaignLevelCompletion(prev, puzzleId, stats);
        if (next === prev) return prev;
        saveProgress(next);
        return next;
      });
    },
    [],
  );

  const discoverProduct = useCallback((productName: string) => {
    setProgress((prev) => {
      const next = recordProductDiscovery(prev, productName);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const markInfiniteComplete = useCallback((wave: number) => {
    setProgress((prev) => {
      const next = markInfiniteWaveComplete(prev, wave);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const saveSession = useCallback((sessionKey: string, foundWordIds: readonly string[]) => {
    setProgress((prev) => {
      const next = setSessionFoundWords(prev, sessionKey, foundWordIds);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const getSavedFoundWords = useCallback(
    (sessionKey: string) => getSessionFoundWords(progress, sessionKey),
    [progress],
  );

  const resetSession = useCallback((sessionKey: string) => {
    setProgress((prev) => {
      const next = clearSession(prev, sessionKey);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const useHint = useCallback((sessionKey: string, cellKey: string) => {
    setProgress((prev) => {
      const next = markHintUsed(prev, sessionKey, cellKey);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const markDailyDone = useCallback((dateKey: string) => {
    setProgress((prev) => {
      const next = markDailyComplete(prev, dateKey);
      if (next === prev) return prev;
      saveProgress(next);
      return next;
    });
  }, []);

  const todayKey = dailyDateKey();
  const totalLevels = ORDERED_LEVEL_IDS.length;
  const completed = completedCount(progress);
  const continueLevelId = findContinueLevelId(ORDERED_LEVEL_IDS, progress);
  const campaignComplete = isCampaignComplete(progress, ORDERED_LEVEL_IDS);
  const infiniteUnlocked = isInfiniteUnlocked(progress, ORDERED_LEVEL_IDS);
  const infiniteWaveCompleted = progress.infiniteWaveCompleted;
  const nextInfiniteWave = getNextInfiniteWave(progress);
  const starsEarned = totalStarsEarned(progress, ORDERED_LEVEL_IDS);
  const starsTotal = maxStarsAvailable(ORDERED_LEVEL_IDS);
  const dailyStreak = calculateDailyStreak(progress.dailyCompletedDates);
  const productCollection = collectionProgress(progress.discoveredProducts);

  const helpers = useMemo(
    () => ({
      isComplete: (puzzleId: string) => isLevelComplete(progress, puzzleId),
      isUnlocked: (levelIndex: number) =>
        isLevelUnlocked(levelIndex, progress, ORDERED_LEVEL_IDS),
      isInfiniteWaveUnlocked: (wave: number) =>
        isInfiniteWaveUnlocked(wave, progress, ORDERED_LEVEL_IDS),
      isHintUsed: (sessionKey: string) => isHintUsed(progress, sessionKey),
      getHintCellKey: (sessionKey: string) => getHintCellKey(progress, sessionKey),
      isDailyComplete: (dateKey: string) => isDailyComplete(progress, dateKey),
      getLevelStars: (puzzleId: string) => getLevelStars(progress, puzzleId),
      getLevelBestTimeMs: (puzzleId: string) => getLevelBestTimeMs(progress, puzzleId),
    }),
    [progress],
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
