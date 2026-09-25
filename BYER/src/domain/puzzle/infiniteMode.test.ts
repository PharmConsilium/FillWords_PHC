import { describe, expect, it } from 'vitest';
import { wordLetterCount } from '../catalog/wordLetters';
import {
  createInfinitePuzzle,
  infiniteGridSize,
  pickWordsForGrid,
} from './infiniteMode';

describe('infiniteGridSize', () => {
  it('grows with wave number up to 10', () => {
    expect(infiniteGridSize(1)).toBe(5);
    expect(infiniteGridSize(2)).toBe(5);
    expect(infiniteGridSize(3)).toBe(6);
    expect(infiniteGridSize(13)).toBe(10);
  });
});

describe('pickWordsForGrid', () => {
  it('returns words that fill the grid', () => {
    for (const wave of [1, 2, 5, 10]) {
      const size = infiniteGridSize(wave);
      const words = pickWordsForGrid(size, wave * 99);
      const letters = words.reduce((sum, word) => sum + wordLetterCount(word), 0);
      expect(letters).toBe(size * size);
      expect(words.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('createInfinitePuzzle', () => {
  it('generates a full grid for early waves', () => {
    for (const wave of [1, 2, 3, 5, 8]) {
      const puzzle = createInfinitePuzzle(wave);
      expect(puzzle.words.length).toBeGreaterThan(0);
      expect(puzzle.letters.every((letter) => letter.length === 1)).toBe(true);
      expect(puzzle.letters).toHaveLength(puzzle.size.rows * puzzle.size.cols);
    }
  });
});
