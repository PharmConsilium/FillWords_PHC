import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { demoPuzzle, letterAt } from '../../domain/puzzle/demoPuzzle';
import { isValidSelectionStep, matchWordFromSelection, wordCellCoords } from '../../domain/puzzle/selection';
import type { CellCoord, PuzzleDefinition } from '../../domain/puzzle/types';
import styles from './GameScreen.module.css';

const puzzlesById: Record<string, PuzzleDefinition> = {
  [demoPuzzle.id]: demoPuzzle,
};

const coordKey = (coord: CellCoord): string => `${coord.row}:${coord.col}`;

export const GameScreen = () => {
  const { puzzleId } = useParams<{ puzzleId: string }>();
  const puzzle = puzzleId ? puzzlesById[puzzleId] : undefined;
  const [selection, setSelection] = useState<CellCoord[]>([]);
  const [foundWordIds, setFoundWordIds] = useState<string[]>([]);

  const selectedKeys = useMemo(() => new Set(selection.map(coordKey)), [selection]);
  const foundCellKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const word of puzzle?.words ?? []) {
      if (!foundWordIds.includes(word.id)) continue;
      for (const coord of wordCellCoords(word)) {
        keys.add(coordKey(coord));
      }
    }
    return keys;
  }, [puzzle, foundWordIds]);

  if (!puzzle) {
    return (
      <main className={styles.page}>
        <p>Пазл не найден.</p>
        <Link to="/">На главную</Link>
      </main>
    );
  }

  const onCellPointerDown = (coord: CellCoord): void => {
    setSelection([coord]);
  };

  const onCellPointerEnter = (coord: CellCoord): void => {
    setSelection((prev) => {
      if (prev.length === 0) return prev;
      if (!isValidSelectionStep(puzzle, prev, coord)) return prev;
      return [...prev, coord];
    });
  };

  const onPointerUp = (): void => {
    const matched = matchWordFromSelection(puzzle, selection);
    if (matched && !foundWordIds.includes(matched.id)) {
      setFoundWordIds((prev) => [...prev, matched.id]);
    }
    setSelection([]);
  };

  const { rows, cols } = puzzle.size;

  return (
    <main className={styles.page} onPointerUp={onPointerUp}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Назад
        </Link>
        <h1 className={styles.title}>{puzzle.title}</h1>
      </header>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const key = coordKey({ row, col });
          const isSelected = selectedKeys.has(key);
          const isFound = foundCellKeys.has(key);

          return (
            <button
              key={key}
              type="button"
              className={[
                styles.cell,
                isSelected ? styles.cellSelected : '',
                isFound ? styles.cellFound : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerDown={() => onCellPointerDown({ row, col })}
              onPointerEnter={() => onCellPointerEnter({ row, col })}
            >
              {letterAt(puzzle, row, col)}
            </button>
          );
        })}
      </div>

      <ul className={styles.wordList}>
        {puzzle.words.map((word) => (
          <li
            key={word.id}
            className={foundWordIds.includes(word.id) ? styles.wordFound : undefined}
          >
            {word.text}
          </li>
        ))}
      </ul>
    </main>
  );
};
