export type GridSize = {

  rows: number;

  cols: number;

};



export type CellCoord = {

  row: number;

  col: number;

};



/** Ортогональные шаги: вверх, вниз, влево, вправо. */

export type OrthogonalStep = {

  dRow: -1 | 0 | 1;

  dCol: -1 | 0 | 1;

};



export type PuzzleWord = {

  id: string;

  /** Буквы на сетке (без пробелов и дефисов). */

  text: string;

  /** Отображаемое название, если отличается от text. */

  label?: string;

  /** Путь слова по соседним клеткам (может изгибаться). */

  path: CellCoord[];

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


