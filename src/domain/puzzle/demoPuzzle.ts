import type { PuzzleDefinition } from './types';

/** Демо-пазл для проверки каркаса UI. */
export const demoPuzzle: PuzzleDefinition = {
  id: 'demo-1',
  title: 'Демо: здоровье',
  size: { rows: 5, cols: 5 },
  letters: [
    'З', 'Д', 'О', 'Р', 'В',
    'А', 'П', 'Т', 'Е', 'К',
    'Л', 'Е', 'К', 'А', 'Р',
    'С', 'О', 'Н', 'С', 'В',
    'Т', 'В', 'И', 'Т', 'А',
  ],
  words: [
    { id: 'w1', text: 'ЗДОРВ', start: { row: 0, col: 0 }, direction: 'horizontal' },
    { id: 'w2', text: 'АПТЕКА', start: { row: 1, col: 0 }, direction: 'horizontal' },
    { id: 'w3', text: 'ЛЕКАР', start: { row: 2, col: 0 }, direction: 'horizontal' },
    { id: 'w4', text: 'СОН', start: { row: 3, col: 0 }, direction: 'horizontal' },
    { id: 'w5', text: 'ВИТА', start: { row: 4, col: 1 }, direction: 'horizontal' },
  ],
};

export const letterAt = (puzzle: PuzzleDefinition, row: number, col: number): string => {
  const { cols } = puzzle.size;
  const index = row * cols + col;
  return puzzle.letters[index] ?? '';
};
