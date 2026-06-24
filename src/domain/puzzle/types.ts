export type GridSize = {
  rows: number;
  cols: number;
};

export type CellCoord = {
  row: number;
  col: number;
};

export type WordDirection = 'horizontal' | 'vertical';

export type PuzzleWord = {
  id: string;
  text: string;
  start: CellCoord;
  direction: WordDirection;
};

export type PuzzleDefinition = {
  id: string;
  title: string;
  size: GridSize;
  /** Буквы сетки построчно, rows × cols */
  letters: string[];
  words: PuzzleWord[];
};

export type PuzzleProgress = {
  puzzleId: string;
  foundWordIds: string[];
};
