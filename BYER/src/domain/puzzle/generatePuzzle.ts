import { wordLetters } from '../catalog/wordLetters';
import type { CellCoord, PuzzleDefinition, PuzzleWord } from './types';

const ORTHOGONAL_STEPS: readonly { dRow: -1 | 0 | 1; dCol: -1 | 0 | 1 }[] = [
  { dRow: 0, dCol: 1 },
  { dRow: 0, dCol: -1 },
  { dRow: 1, dCol: 0 },
  { dRow: -1, dCol: 0 },
];

const MAX_PACK_ATTEMPTS = 20_000;

const mulberry32 = (seed: number) => {
  let t = seed;
  return (): number => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const coordKey = (coord: CellCoord): string => `${coord.row}:${coord.col}`;

const neighbors = (coord: CellCoord, rows: number, cols: number): CellCoord[] =>
  ORTHOGONAL_STEPS.map((step) => ({
    row: coord.row + step.dRow,
    col: coord.col + step.dCol,
  })).filter((next) => next.row >= 0 && next.col >= 0 && next.row < rows && next.col < cols);

const freeNeighbors = (
  grid: (string | null)[][],
  coord: CellCoord,
  usedInPath: Set<string>,
): CellCoord[] => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  return neighbors(coord, rows, cols).filter((next) => {
    if (usedInPath.has(coordKey(next))) return false;
    return grid[next.row]![next.col] === null;
  });
};

const isGridFull = (grid: (string | null)[][]): boolean =>
  grid.every((row) => row.every((cell) => cell !== null));

const commitPath = (grid: (string | null)[][], text: string, path: CellCoord[]): void => {
  for (let i = 0; i < path.length; i += 1) {
    const cell = path[i]!;
    grid[cell.row]![cell.col] = text[i]!;
  }
};

const findSnakePath = (
  grid: (string | null)[][],
  text: string,
  random: () => number,
): CellCoord[] | null => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const starts: CellCoord[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (grid[row]![col] === null) {
        starts.push({ row, col });
      }
    }
  }

  const search = (
    letterIndex: number,
    path: CellCoord[],
    usedInPath: Set<string>,
  ): boolean => {
    const coord = path[letterIndex]!;
    if (grid[coord.row]![coord.col] !== null) return false;
    if (usedInPath.has(coordKey(coord))) return false;

    usedInPath.add(coordKey(coord));

    if (letterIndex === text.length - 1) return true;

    const nextCandidates = shuffle(freeNeighbors(grid, coord, usedInPath), random).sort(
      (a, b) => freeNeighbors(grid, a, usedInPath).length - freeNeighbors(grid, b, usedInPath).length,
    );

    for (const next of nextCandidates) {
      path[letterIndex + 1] = next;
      if (search(letterIndex + 1, path, usedInPath)) return true;
    }

    usedInPath.delete(coordKey(coord));
    return false;
  };

  for (const start of shuffle(starts, random)) {
    const path: CellCoord[] = [{ ...start }];
    const usedInPath = new Set<string>();
    if (search(0, path, usedInPath)) {
      return path;
    }
  }

  return null;
};

type WordEntry = { label: string; text: string };

const tryPack = (
  entries: WordEntry[],
  grid: (string | null)[][],
  random: () => number,
  puzzleId: string,
): PuzzleWord[] | null => {
  const placed: PuzzleWord[] = [];

  for (const entry of entries) {
    const path = findSnakePath(grid, entry.text, random);
    if (!path) return null;

    commitPath(grid, entry.text, path);
    placed.push({
      id: `${puzzleId}-w${placed.length}`,
      text: entry.text,
      label: entry.label,
      path,
    });
  }

  return isGridFull(grid) ? placed : null;
};

const gridToLetters = (grid: (string | null)[][]): string[] =>
  grid.flatMap((row) => row.map((letter) => letter ?? ''));

export type GeneratePuzzleOptions = {
  id: string;
  title: string;
  words: readonly string[];
  size: number;
  seed: number;
};

export const generatePuzzle = ({
  id,
  title,
  words,
  size,
  seed,
}: GeneratePuzzleOptions): PuzzleDefinition => {
  const cellCount = size * size;
  const entries: WordEntry[] = words.map((label) => ({
    label,
    text: wordLetters(label),
  }));  const totalLetters = entries.reduce((sum, entry) => sum + entry.text.length, 0);

  if (totalLetters !== cellCount) {
    throw new Error(
      `Сумма букв (${totalLetters}) должна равняться размеру сетки ${size}×${size} = ${cellCount}`,
    );
  }

  for (let attempt = 0; attempt < MAX_PACK_ATTEMPTS; attempt += 1) {
    const random = mulberry32(seed + attempt);
    const grid: (string | null)[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null),
    );
    const order = shuffle(entries, random).sort((a, b) => b.text.length - a.text.length);
    const placed = tryPack(order, grid, random, id);

    if (placed) {
      return {
        id,
        title,
        size: { rows: size, cols: size },
        letters: gridToLetters(grid),
        words: placed,
      };
    }
  }

  throw new Error(
    `Не удалось заполнить сетку ${size}×${size} без пропусков (seed ${seed}, ${words.length} слов)`,
  );
};

export const letterAt = (puzzle: PuzzleDefinition, row: number, col: number): string => {
  const { cols } = puzzle.size;
  const index = row * cols + col;
  return puzzle.letters[index] ?? '';
};
