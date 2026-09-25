import { describe, expect, it } from 'vitest';
import { puzzles } from './puzzles';
import { cellKeyFromCoord, parseCellKey, pickHintTarget } from './hints';

const samplePuzzle = puzzles[0]!;

describe('pickHintTarget', () => {
  it('returns null when all words are found', () => {
    const found = samplePuzzle.words.map((word) => word.id);
    expect(pickHintTarget(samplePuzzle, found, 'session')).toBeNull();
  });

  it('returns the first cell of an unfound word', () => {
    const hint = pickHintTarget(samplePuzzle, [], 'session');
    expect(hint).not.toBeNull();
    expect(samplePuzzle.words.some((word) => word.id === hint!.wordId)).toBe(true);
    expect(hint!.cell).toEqual(
      samplePuzzle.words.find((word) => word.id === hint!.wordId)!.path[0],
    );
  });

  it('is deterministic for the same seed and progress', () => {
    const a = pickHintTarget(samplePuzzle, [], 'level-1');
    const b = pickHintTarget(samplePuzzle, [], 'level-1');
    expect(a).toEqual(b);
  });
});

describe('cellKeyFromCoord', () => {
  it('round-trips through parseCellKey', () => {
    const key = cellKeyFromCoord({ row: 2, col: 5 });
    expect(parseCellKey(key)).toEqual({ row: 2, col: 5 });
  });
});
