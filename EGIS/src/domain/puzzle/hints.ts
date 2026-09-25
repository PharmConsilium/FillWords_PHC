import type { CellCoord, PuzzleDefinition } from './types';

export type HintTarget = {
  wordId: string;
  wordLabel: string;
  cell: CellCoord;
};

export const cellKeyFromCoord = (coord: CellCoord): string => `${coord.row}:${coord.col}`;

export const parseCellKey = (key: string): CellCoord | null => {
  const [rowRaw, colRaw] = key.split(':');
  const row = Number.parseInt(rowRaw ?? '', 10);
  const col = Number.parseInt(colRaw ?? '', 10);
  if (!Number.isFinite(row) || !Number.isFinite(col)) {
    return null;
  }
  return { row, col };
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

/** Выбирает случайное ненайденное слово и первую букву его пути. */
export const pickHintTarget = (
  puzzle: PuzzleDefinition,
  foundWordIds: readonly string[],
  seed: string,
): HintTarget | null => {
  const remaining = puzzle.words.filter((word) => !foundWordIds.includes(word.id));
  if (remaining.length === 0) {
    return null;
  }

  const index = hashString(`${seed}:${foundWordIds.join(',')}`) % remaining.length;
  const word = remaining[index]!;
  const cell = word.path[0];
  if (!cell) {
    return null;
  }

  return {
    wordId: word.id,
    wordLabel: word.label ?? word.text,
    cell,
  };
};
