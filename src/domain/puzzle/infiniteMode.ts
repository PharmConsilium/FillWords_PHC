import { BAYER_PRODUCTS_RB } from '../catalog/bayerProducts';
import { NEUTRAL_WORDS } from '../catalog/neutralWords';
import { wordLetterCount } from '../catalog/wordLetters';
import { generatePuzzle } from './generatePuzzle';
import type { PuzzleDefinition } from './types';

const WORD_POOL = [...BAYER_PRODUCTS_RB, ...NEUTRAL_WORDS] as const;

const mulberry32 = (seed: number) => {
  let t = seed;
  return (): number => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

/** Размер сетки для волны: от 5×5, растёт каждые 2 волны, максимум 10×10. */
export const infiniteGridSize = (wave: number): number => {
  if (wave < 1) {
    throw new Error(`Номер волны должен быть ≥ 1, получено ${wave}`);
  }
  return Math.min(4 + Math.ceil(wave / 2), 10);
};

const findWordSubset = (
  candidates: readonly { word: string; length: number }[],
  target: number,
  start: number,
  picked: string[],
): string[] | null => {
  if (target === 0) {
    return picked;
  }
  if (target < 0) {
    return null;
  }

  for (let index = start; index < candidates.length; index += 1) {
    const candidate = candidates[index]!;
    if (candidate.length > target) {
      continue;
    }
    const result = findWordSubset(
      candidates,
      target - candidate.length,
      index + 1,
      [...picked, candidate.word],
    );
    if (result) {
      return result;
    }
  }

  return null;
};

export const pickWordsForGrid = (size: number, seed: number): string[] => {
  const target = size * size;
  const candidates = WORD_POOL.map((word) => ({
    word,
    length: wordLetterCount(word),
  }))
    .filter((entry) => entry.length >= 3 && entry.length <= target)
    .sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const random = mulberry32(seed + attempt);
    const order = shuffle(candidates, random);
    const subset = findWordSubset(order, target, 0, []);
    if (subset && subset.length >= 3) {
      return subset;
    }
  }

  throw new Error(`Не удалось подобрать слова для сетки ${size}×${size}`);
};

export const createInfinitePuzzle = (wave: number): PuzzleDefinition => {
  const size = infiniteGridSize(wave);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const words = pickWordsForGrid(size, wave * 10_000 + attempt);
    try {
      return generatePuzzle({
        id: `infinite-wave-${wave}`,
        title: `Волна ${wave}`,
        words,
        size,
        seed: wave * 1000 + attempt,
      });
    } catch {
      // другой набор слов или seed
    }
  }

  throw new Error(`Не удалось сгенерировать волну ${wave}`);
};

export const parseInfiniteWave = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }
  const wave = Number.parseInt(value, 10);
  if (!Number.isFinite(wave) || wave < 1) {
    return undefined;
  }
  return wave;
};
