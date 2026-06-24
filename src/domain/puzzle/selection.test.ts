import { describe, expect, it } from 'vitest';
import { demoPuzzle } from './demoPuzzle';
import { matchWordFromSelection } from './selection';

describe('matchWordFromSelection', () => {
  it('finds a horizontal demo word', () => {
    const word = matchWordFromSelection(demoPuzzle, [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ]);
    expect(word?.id).toBe('w1');
  });
});
