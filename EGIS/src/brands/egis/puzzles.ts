import { generatePuzzle } from '../../domain/puzzle/generatePuzzle';
import type { PuzzleDefinition } from '../../domain/puzzle/types';
import { EGIS_LEVEL_DEFINITIONS } from './levelDefinitions';

export const egisPuzzles: PuzzleDefinition[] = EGIS_LEVEL_DEFINITIONS.map((level, index) =>
  generatePuzzle({
    id: `egis-level-${index + 1}`,
    title: `Уровень ${index + 1}`,
    words: level.words,
    size: level.size,
    seed: level.seed,
  }),
);

export const egisPuzzlesById: Record<string, PuzzleDefinition> = Object.fromEntries(
  egisPuzzles.map((puzzle) => [puzzle.id, puzzle]),
);
