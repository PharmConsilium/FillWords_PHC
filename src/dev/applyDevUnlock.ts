import { markLevelComplete, saveProgress } from '../domain/progress/gameProgress';
import { EMPTY_PROGRESS } from '../domain/progress/types';
import { puzzles } from '../domain/puzzle/puzzles';

/** Только dev: ?unlock=infinite — пройти кампанию для проверки бесконечного режима. */
export const applyDevUnlockInfinite = (): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('unlock') !== 'infinite') {
    return;
  }

  let progress = EMPTY_PROGRESS;
  for (const puzzle of puzzles) {
    progress = markLevelComplete(progress, puzzle.id);
  }
  saveProgress(progress);

  params.delete('unlock');
  const query = params.toString();
  window.history.replaceState({}, '', query ? `?${query}` : window.location.pathname);
};
