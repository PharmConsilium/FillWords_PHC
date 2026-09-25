import { generatePuzzle } from './generatePuzzle';
import { LEVEL_DEFINITIONS } from './levelDefinitions';
import type { PuzzleDefinition } from './types';

export const puzzles: PuzzleDefinition[] = LEVEL_DEFINITIONS.map((level, index) =>
  generatePuzzle({
    id: `level-${index + 1}`,
    title: `Уровень ${index + 1}`,
    words: level.words,
    size: level.size,
    seed: level.seed,
  }),
);

export const puzzlesById: Record<string, PuzzleDefinition> = Object.fromEntries(
  puzzles.map((puzzle) => [puzzle.id, puzzle]),
);
