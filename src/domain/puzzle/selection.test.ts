import { describe, expect, it } from 'vitest';
import { puzzlesById } from './puzzles';
import { isValidSelectionStep, matchWordFromSelection } from './selection';

const level1 = puzzlesById['level-1']!;

describe('matchWordFromSelection', () => {
  it('finds a placed word on level 1', () => {
    const word = level1.words[0]!;
    expect(matchWordFromSelection(level1, word.path)?.id).toBe(word.id);
  });

  it('finds a word when selection is reversed', () => {
    const word = level1.words[0]!;
    const reversed = [...word.path].reverse();
    expect(matchWordFromSelection(level1, reversed)?.id).toBe(word.id);
  });
});

describe('isValidSelectionStep', () => {
  it('allows orthogonal steps', () => {
    const start = { row: 2, col: 2 };
    const right = { row: 2, col: 3 };
    const down = { row: 3, col: 3 };

    expect(isValidSelectionStep(level1, [start], right)).toBe(true);
    expect(isValidSelectionStep(level1, [start, right], down)).toBe(true);
  });

  it('rejects diagonal steps', () => {
    const start = { row: 2, col: 2 };
    const diagonal = { row: 3, col: 3 };
    expect(isValidSelectionStep(level1, [start], diagonal)).toBe(false);
  });

  it('rejects revisiting a cell', () => {
    const a = { row: 1, col: 1 };
    const b = { row: 1, col: 2 };
    expect(isValidSelectionStep(level1, [a, b], a)).toBe(false);
  });
});

describe('puzzle generation', () => {
  it('generates all 18 configured levels', () => {
    expect(Object.keys(puzzlesById)).toHaveLength(18);
  });

  it('places each word as a snake path matching its text', () => {
    for (const puzzle of Object.values(puzzlesById)) {
      for (const word of puzzle.words) {
        expect(word.path).toHaveLength(word.text.length);
        const letters = word.path.map(
          ({ row, col }) => puzzle.letters[row * puzzle.size.cols + col],
        );
        expect(letters.join('')).toBe(word.text);
      }
    }
  });

  it('fills every cell on the grid', () => {
    for (const puzzle of Object.values(puzzlesById)) {
      const cellCount = puzzle.size.rows * puzzle.size.cols;
      expect(puzzle.letters).toHaveLength(cellCount);
      expect(puzzle.letters.every((letter) => letter.length > 0)).toBe(true);
    }
  });
});
