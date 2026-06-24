import type { CellCoord, PuzzleDefinition, PuzzleWord } from './types';

const ORTHOGONAL_STEPS: readonly { dRow: -1 | 0 | 1; dCol: -1 | 0 | 1 }[] = [
  { dRow: 0, dCol: 1 },
  { dRow: 0, dCol: -1 },
  { dRow: 1, dCol: 0 },
  { dRow: -1, dCol: 0 },
];

const inBounds = (puzzle: PuzzleDefinition, coord: CellCoord): boolean =>
  coord.row >= 0 &&
  coord.col >= 0 &&
  coord.row < puzzle.size.rows &&
  coord.col < puzzle.size.cols;

/** Координаты ячеек слова на сетке. */
export const wordCellCoords = (word: PuzzleWord): CellCoord[] => word.path;

/** Проверяет, что выделение совпадает со словом (прямой или обратный путь). */
export const matchWordFromSelection = (
  puzzle: PuzzleDefinition,
  selection: CellCoord[],
): PuzzleWord | null => {
  if (selection.length < 2) return null;

  const normalized = [...selection];
  const reversed = [...selection].reverse();

  for (const word of puzzle.words) {
    const target = word.path;
    if (coordsEqual(normalized, target) || coordsEqual(reversed, target)) {
      return word;
    }
  }

  return null;
};

const coordsEqual = (a: CellCoord[], b: CellCoord[]): boolean =>
  a.length === b.length &&
  a.every((coord, index) => coord.row === b[index]?.row && coord.col === b[index]?.col);

const isOrthogonalNeighbor = (from: CellCoord, to: CellCoord): boolean =>
  ORTHOGONAL_STEPS.some(
    (step) => from.row + step.dRow === to.row && from.col + step.dCol === to.col,
  );

export const isValidSelectionStep = (
  puzzle: PuzzleDefinition,
  selection: CellCoord[],
  next: CellCoord,
): boolean => {
  if (!inBounds(puzzle, next)) return false;
  if (selection.some((c) => c.row === next.row && c.col === next.col)) return false;
  if (selection.length === 0) return true;

  const last = selection[selection.length - 1]!;
  return isOrthogonalNeighbor(last, next);
};

/** Буквы выделенного пути на сетке. */
export const selectionText = (puzzle: PuzzleDefinition, selection: CellCoord[]): string =>
  selection
    .map(({ row, col }) => {
      const index = row * puzzle.size.cols + col;
      return puzzle.letters[index] ?? '';
    })
    .join('');
