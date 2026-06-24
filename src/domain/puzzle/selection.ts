import type { CellCoord, PuzzleDefinition, PuzzleWord } from './types';

const inBounds = (puzzle: PuzzleDefinition, coord: CellCoord): boolean =>
  coord.row >= 0 &&
  coord.col >= 0 &&
  coord.row < puzzle.size.rows &&
  coord.col < puzzle.size.cols;

const step = (coord: CellCoord, direction: PuzzleWord['direction']): CellCoord => ({
  row: coord.row + (direction === 'vertical' ? 1 : 0),
  col: coord.col + (direction === 'horizontal' ? 1 : 0),
});

/** Координаты ячеек слова на сетке. */
export const wordCellCoords = (word: PuzzleWord): CellCoord[] => {
  const coords: CellCoord[] = [];
  let current = { ...word.start };
  for (let i = 0; i < word.text.length; i += 1) {
    coords.push({ ...current });
    current = step(current, word.direction);
  }
  return coords;
};

/** Проверяет, что выделение совпадает со словом (в любом направлении). */
export const matchWordFromSelection = (
  puzzle: PuzzleDefinition,
  selection: CellCoord[],
): PuzzleWord | null => {
  if (selection.length < 2) return null;

  const normalized = [...selection];
  const reversed = [...selection].reverse();

  for (const word of puzzle.words) {
    const target = wordCellCoords(word);
    if (coordsEqual(normalized, target) || coordsEqual(reversed, target)) {
      return word;
    }
  }

  return null;
};

const coordsEqual = (a: CellCoord[], b: CellCoord[]): boolean =>
  a.length === b.length &&
  a.every((coord, index) => coord.row === b[index]?.row && coord.col === b[index]?.col);

export const isValidSelectionStep = (
  puzzle: PuzzleDefinition,
  selection: CellCoord[],
  next: CellCoord,
): boolean => {
  if (!inBounds(puzzle, next)) return false;
  if (selection.some((c) => c.row === next.row && c.col === next.col)) return false;
  if (selection.length === 0) return true;

  const first = selection[0];
  const last = selection[selection.length - 1];
  const dRow = Math.sign(next.row - last.row);
  const dCol = Math.sign(next.col - last.col);

  if (selection.length === 1) {
    const horizontal = next.row === first.row && Math.abs(next.col - first.col) === 1;
    const vertical = next.col === first.col && Math.abs(next.row - first.row) === 1;
    return horizontal || vertical;
  }

  const baseDRow = Math.sign(last.row - first.row);
  const baseDCol = Math.sign(last.col - first.col);
  return dRow === baseDRow && dCol === baseDCol;
};
