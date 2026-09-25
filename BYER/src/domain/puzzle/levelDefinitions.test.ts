import { describe, expect, it } from 'vitest';
import { wordLetterCount } from '../catalog/wordLetters';
import { generatePuzzle } from './generatePuzzle';
import { LEVEL_DEFINITIONS } from './levelDefinitions';

describe('LEVEL_DEFINITIONS', () => {
  it('fills each grid exactly (sum of letter counts = size²)', () => {
    for (const [index, level] of LEVEL_DEFINITIONS.entries()) {
      const cellCount = level.size * level.size;
      const letterSum = level.words.reduce((sum, word) => sum + wordLetterCount(word), 0);
      expect(letterSum, `level index ${index}, size ${level.size}`).toBe(cellCount);
    }
  });

  it('generates a valid puzzle for every level', () => {
    for (const [index, level] of LEVEL_DEFINITIONS.entries()) {
      const puzzle = generatePuzzle({
        id: `test-level-${index + 1}`,
        title: `Test ${index + 1}`,
        words: level.words,
        size: level.size,
        seed: level.seed,
      });

      expect(puzzle.words.length).toBe(level.words.length);
      expect(puzzle.size.rows).toBe(level.size);
      expect(puzzle.size.cols).toBe(level.size);
    }
  });
});
