import { getBrandConfig, isBrandKey } from '../brands';
import { markLevelComplete, saveProgress } from '../domain/progress/gameProgress';
import { EMPTY_PROGRESS } from '../domain/progress/types';

const brandFromPath = (): string | undefined => {
  const [, maybeBrand] = window.location.pathname.split('/');
  return maybeBrand;
};

/** Только dev: ?unlock=infinite — пройти кампанию для проверки бесконечного режима. */
export const applyDevUnlockInfinite = (): void => {
  if (!import.meta.env.DEV) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const unlockMode = params.get('unlock');
  if (unlockMode !== 'infinite' && unlockMode !== 'all') {
    return;
  }

  const brand = getBrandConfig(brandFromPath());
  let progress = EMPTY_PROGRESS;
  for (const puzzle of brand.puzzles) {
    progress = markLevelComplete(progress, puzzle.id);
  }
  saveProgress(progress, localStorage, brand.storageKey);

  params.delete('unlock');
  const query = params.toString();
  const fallbackPath = isBrandKey(brandFromPath()) ? window.location.pathname : '/bayer';
  window.history.replaceState({}, '', query ? `${fallbackPath}?${query}` : fallbackPath);
};
