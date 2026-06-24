import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { getProductInfo } from '../../domain/catalog/bayerProductInfo';
import { categorizeWord } from '../../domain/catalog/wordCategory';
import {
  createDailyPuzzle,
  dailyDateKey,
  dailySessionKey,
} from '../../domain/puzzle/dailyChallenge';
import { letterAt } from '../../domain/puzzle/generatePuzzle';
import { cellKeyFromCoord, parseCellKey, pickHintTarget } from '../../domain/puzzle/hints';
import { createInfinitePuzzle, parseInfiniteWave } from '../../domain/puzzle/infiniteMode';
import { puzzles, puzzlesById } from '../../domain/puzzle/puzzles';
import {
  isValidSelectionStep,
  matchWordFromSelection,
  selectionText,
  wordCellCoords,
} from '../../domain/puzzle/selection';
import type { CellCoord, PuzzleDefinition, PuzzleWord } from '../../domain/puzzle/types';
import { getSessionFoundWords, isHintUsed } from '../../domain/progress/gameProgress';
import {
  calculateLevelStars,
  formatElapsed,
  threeStarTimeLimitMs,
} from '../../domain/progress/levelStars';
import type { LevelStars } from '../../domain/progress/types';
import { useGameProgress } from '../progress/useGameProgress';
import { Button } from '../../shared/ui/Button/Button';
import { BayerLogo } from '../../shared/ui/BayerLogo/BayerLogo';
import { StarsDisplay } from '../../shared/ui/StarsDisplay/StarsDisplay';
import { ProductToast } from './ProductToast';
import { wordHighlightColor } from './wordColors';
import styles from './GameScreen.module.css';

const coordKey = (coord: CellCoord): string => `${coord.row}:${coord.col}`;

const wordColorById = (puzzle: PuzzleDefinition) =>
  Object.fromEntries(puzzle.words.map((word, index) => [word.id, wordHighlightColor(index)]));

const filterValidFoundIds = (puzzle: PuzzleDefinition, ids: readonly string[]): string[] => {
  const validIds = new Set(puzzle.words.map((word) => word.id));
  return ids.filter((id) => validIds.has(id));
};

const hintLabelForCell = (
  puzzle: PuzzleDefinition,
  cellKey: string,
  foundWordIds: readonly string[],
): string | null => {
  const cell = parseCellKey(cellKey);
  if (!cell) return null;

  const word = puzzle.words.find(
    (item) =>
      !foundWordIds.includes(item.id) &&
      item.path[0]?.row === cell.row &&
      item.path[0]?.col === cell.col,
  );

  return word ? (word.label ?? word.text) : null;
};

const displayName = (word: PuzzleWord): string => word.label ?? word.text;

export const GameScreen = () => {
  const location = useLocation();
  const { puzzleId, wave: waveParam } = useParams<{ puzzleId?: string; wave?: string }>();
  const isDaily = location.pathname === '/play/daily';
  const infiniteWave = parseInfiniteWave(waveParam);
  const isInfinite = !isDaily && infiniteWave !== undefined;
  const todayKey = dailyDateKey();

  const {
    progress: gameProgress,
    recordCampaignCompletion,
    discoverProduct,
    markInfiniteComplete,
    markDailyDone,
    saveSession,
    useHint,
    isUnlocked,
    isInfiniteWaveUnlocked,
    nextInfiniteWave,
    isComplete: isLevelDone,
    isHintUsed: isSessionHintUsed,
    getHintCellKey,
    isTodayDailyComplete,
  } = useGameProgress();

  const puzzle = useMemo((): PuzzleDefinition | undefined => {
    if (isDaily) {
      return createDailyPuzzle();
    }
    if (isInfinite && infiniteWave !== undefined) {
      return createInfinitePuzzle(infiniteWave);
    }
    return puzzleId ? puzzlesById[puzzleId] : undefined;
  }, [isDaily, isInfinite, infiniteWave, puzzleId]);

  const [selection, setSelection] = useState<CellCoord[]>([]);
  const [foundWordIds, setFoundWordIds] = useState<string[]>([]);
  const [wrongSelection, setWrongSelection] = useState(false);
  const [hintLabel, setHintLabel] = useState<string | null>(null);
  const [productToast, setProductToast] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [winStars, setWinStars] = useState<LevelStars | null>(null);
  const [winElapsedMs, setWinElapsedMs] = useState(0);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionStartRef = useRef(Date.now());

  const levelIndex = useMemo(
    () => (!isInfinite && !isDaily && puzzleId ? puzzles.findIndex((item) => item.id === puzzleId) : -1),
    [isDaily, isInfinite, puzzleId],
  );

  const isCampaignLevel = !isDaily && !isInfinite && levelIndex >= 0;

  const sessionKey = isDaily
    ? dailySessionKey()
    : isInfinite
      ? `infinite-${infiniteWave}`
      : (puzzleId ?? '');

  const alreadyCompleted =
    puzzle !== undefined &&
    ((isDaily && isTodayDailyComplete) ||
      (!isInfinite && !isDaily && puzzleId !== undefined && isLevelDone(puzzleId)));

  const hintUsed = isSessionHintUsed(sessionKey);
  const savedHintCellKey = getHintCellKey(sessionKey);

  useEffect(() => {
    if (!puzzle || !sessionKey) return;

    setSelection([]);
    setWrongSelection(false);
    setProductToast(null);
    setWinStars(null);
    sessionStartRef.current = Date.now();
    setElapsedMs(0);

    if (alreadyCompleted) {
      setFoundWordIds([]);
      setHintLabel(null);
      return;
    }

    const saved = filterValidFoundIds(puzzle, getSessionFoundWords(gameProgress, sessionKey));
    setFoundWordIds(saved);

    if (isHintUsed(gameProgress, sessionKey)) {
      const cellKey = getHintCellKey(sessionKey);
      setHintLabel(cellKey ? hintLabelForCell(puzzle, cellKey, saved) : null);
    } else {
      setHintLabel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- progress read at session enter
  }, [sessionKey, puzzle, alreadyCompleted]);

  useEffect(() => {
    if (!sessionKey || alreadyCompleted || foundWordIds.length === 0) return;
    saveSession(sessionKey, foundWordIds);
  }, [sessionKey, foundWordIds, alreadyCompleted, saveSession]);

  useEffect(
    () => () => {
      if (wrongTimerRef.current) {
        clearTimeout(wrongTimerRef.current);
      }
    },
    [],
  );

  const dismissProductToast = useCallback(() => setProductToast(null), []);

  const nextPuzzle = useMemo(() => {
    if (isInfinite || isDaily || levelIndex < 0 || levelIndex >= puzzles.length - 1) return undefined;
    return puzzles[levelIndex + 1];
  }, [isDaily, isInfinite, levelIndex]);

  const showNextLevel =
    !isInfinite && !isDaily && nextPuzzle !== undefined && isUnlocked(levelIndex + 1);

  const showNextInfiniteWave =
    isInfinite && infiniteWave !== undefined && isInfiniteWaveUnlocked(infiniteWave + 1);

  const colors = useMemo(() => (puzzle ? wordColorById(puzzle) : {}), [puzzle]);

  const selectedKeys = useMemo(() => new Set(selection.map(coordKey)), [selection]);
  const foundCellColor = useMemo(() => {
    const map = new Map<string, string>();
    for (const word of puzzle?.words ?? []) {
      if (!foundWordIds.includes(word.id)) continue;
      const color = colors[word.id] ?? wordHighlightColor(0);
      for (const coord of wordCellCoords(word)) {
        map.set(coordKey(coord), color);
      }
    }
    return map;
  }, [puzzle, foundWordIds, colors]);

  const previewText = puzzle ? selectionText(puzzle, selection) : '';
  const totalWords = puzzle?.words.length ?? 0;
  const foundCount = foundWordIds.length;
  const isComplete = puzzle !== undefined && foundCount === totalWords && totalWords > 0;
  const progress = totalWords > 0 ? (foundCount / totalWords) * 100 : 0;

  const showInfiniteEntry =
    !isInfinite && !isDaily && isComplete && levelIndex === puzzles.length - 1;

  useEffect(() => {
    if (!isCampaignLevel || isComplete || alreadyCompleted) return;

    const tick = (): void => {
      setElapsedMs(Date.now() - sessionStartRef.current);
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [isCampaignLevel, isComplete, alreadyCompleted, sessionKey]);

  if (!puzzle) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <p>Уровень не найден.</p>
          <Link to="/">На главную</Link>
        </div>
      </main>
    );
  }

  if (isInfinite && infiniteWave !== undefined && !isInfiniteWaveUnlocked(infiniteWave)) {
    return <Navigate to="/" replace />;
  }

  if (!isInfinite && !isDaily && levelIndex >= 0 && !isUnlocked(levelIndex)) {
    return <Navigate to="/" replace />;
  }

  const triggerWrongFeedback = (): void => {
    setWrongSelection(true);
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(40);
    }
    if (wrongTimerRef.current) {
      clearTimeout(wrongTimerRef.current);
    }
    wrongTimerRef.current = setTimeout(() => setWrongSelection(false), 450);
  };

  const showProductCard = (word: PuzzleWord): void => {
    const name = displayName(word);
    if (categorizeWord(word.text) !== 'bayer') return;
    discoverProduct(name);
    setProductToast(name);
  };

  const onHintClick = (): void => {
    if (hintUsed || isComplete) return;

    const target = pickHintTarget(puzzle, foundWordIds, sessionKey);
    if (!target) return;

    useHint(sessionKey, cellKeyFromCoord(target.cell));
    setHintLabel(target.wordLabel);
  };

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
      const nextFound = [...foundWordIds, matched.id];
      setFoundWordIds(nextFound);
      showProductCard(matched);

      if (hintUsed && savedHintCellKey) {
        setHintLabel(hintLabelForCell(puzzle, savedHintCellKey, nextFound));
      }

      if (nextFound.length === totalWords) {
        const finishedElapsed = Date.now() - sessionStartRef.current;
        setElapsedMs(finishedElapsed);

        if (isDaily) {
          if (!isTodayDailyComplete) {
            markDailyDone(todayKey);
          }
        } else if (isInfinite && infiniteWave !== undefined) {
          markInfiniteComplete(infiniteWave);
        } else if (isCampaignLevel) {
          const stats = {
            gridSize: puzzle.size.rows,
            usedHint: hintUsed,
            elapsedMs: finishedElapsed,
          };
          const stars = calculateLevelStars(stats);
          setWinStars(stars);
          setWinElapsedMs(finishedElapsed);
          recordCampaignCompletion(puzzle.id, stats);
        }
      }
    } else if (selection.length > 0 && !matched) {
      triggerWrongFeedback();
    }
    setSelection([]);
  };

  const { rows, cols } = puzzle.size;
  const selectionColor = wordHighlightColor(foundCount);

  const winTitle = isDaily
    ? 'Челлендж дня пройден!'
    : isInfinite
      ? `Волна ${infiniteWave} пройдена!`
      : 'Уровень пройден!';
  const winText = isDaily
    ? 'Отличная работа! Завтра будет новая сетка.'
    : isInfinite
      ? 'Новая сетка со случайными словами ждёт вас в следующей волне.'
      : 'Вы нашли все слова на этом уровне. Science for a better life.';

  const canUseHint = !hintUsed && !isComplete && foundCount < totalWords;
  const threeStarTargetMs = isCampaignLevel ? threeStarTimeLimitMs(puzzle.size.rows) : 0;

  return (
    <main className={styles.page} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <header className={styles.topBar}>
        <Link to="/" className={styles.back}>
          ← В главное меню
        </Link>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>{puzzle.title}</h1>
          <p className={styles.progressText}>
            {isDaily ? 'Челлендж дня · ' : isInfinite ? 'Бесконечный режим · ' : ''}
            Найдено {foundCount} из {totalWords}
            {isCampaignLevel && !isComplete ? ` · ${formatElapsed(elapsedMs)}` : ''}
          </p>
        </div>
        <BayerLogo compact />
      </header>

      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.hintBar}>
        <div className={styles.hintButtonWrap}>
          <Button variant="surface" disabled={!canUseHint} onClick={onHintClick}>
            Подсказка
          </Button>
        </div>
        {hintUsed && hintLabel && (
          <p className={styles.hintText}>
            Первая буква слова «{hintLabel}» подсвечена на сетке
          </p>
        )}
        {hintUsed && !hintLabel && (
          <p className={styles.hintText}>Подсказка использована</p>
        )}
        {isCampaignLevel && !isComplete && (
          <p className={styles.hintText}>
            До ★★★: {formatElapsed(Math.max(0, threeStarTargetMs - elapsedMs))}
            {!hintUsed ? '' : ' (нужна игра без подсказки)'}
          </p>
        )}
      </div>

      <p
        className={[
          styles.selectionPreview,
          wrongSelection ? styles.selectionPreviewWrong : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
      >
        {previewText || '\u00A0'}
      </p>

      <div className={styles.gridWrap}>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }, (_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const key = coordKey({ row, col });
            const isSelected = selectedKeys.has(key);
            const foundColor = foundCellColor.get(key);
            const isFound = foundColor !== undefined;
            const isHinted = hintUsed && savedHintCellKey === key && !isFound;

            const letter = letterAt(puzzle, row, col);
            const style: CSSProperties = {};
            if (isSelected) {
              style.background = selectionColor;
            } else if (isFound) {
              style.background = foundColor;
            }

            return (
              <button
                key={key}
                type="button"
                className={[
                  styles.cell,
                  isSelected ? styles.cellSelected : '',
                  isFound ? styles.cellFound : '',
                  isHinted ? styles.cellHinted : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={style}
                onPointerDown={() => onCellPointerDown({ row, col })}
                onPointerEnter={() => onCellPointerEnter({ row, col })}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className={styles.wordsSection}>
        <h2 className={styles.wordsTitle}>Слова для поиска</h2>
        <ul className={styles.wordList}>
          {[...puzzle.words]
            .sort((a, b) => displayName(a).localeCompare(displayName(b), 'ru'))
            .map((word) => {
              const isFoundWord = foundWordIds.includes(word.id);
              const category = categorizeWord(word.text);
              const color = colors[word.id] ?? wordHighlightColor(0);
              return (
                <li
                  key={word.id}
                  className={[
                    styles.wordChip,
                    isFoundWord
                      ? styles.wordFound
                      : category === 'neutral'
                        ? styles.wordChipNeutral
                        : styles.wordChipBayer,
                  ].join(' ')}
                  style={isFoundWord ? { background: color } : undefined}
                  title={category === 'bayer' ? getProductInfo(displayName(word)).tagline : undefined}
                >
                  {displayName(word)}
                </li>
              );
            })}
        </ul>
      </section>

      {productToast && (
        <ProductToast productName={productToast} onDismiss={dismissProductToast} />
      )}

      {isComplete && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="win-title">
          <div className={styles.winCard}>
            <div className={styles.winEmoji} aria-hidden="true">
              ✓
            </div>
            <h2 id="win-title" className={styles.winTitle}>
              {winTitle}
            </h2>
            {isCampaignLevel && winStars !== null && (
              <div className={styles.winStars}>
                <StarsDisplay stars={winStars} />
                <p className={styles.winMeta}>
                  Время: {formatElapsed(winElapsedMs)}
                </p>
                <p className={styles.winStarsHint}>
                  ★ — пройден · ★★ — без подсказки · ★★★ — быстро
                </p>
              </div>
            )}
            <p className={styles.winText}>{winText}</p>
            <div className={styles.winActions}>
              {showNextLevel && nextPuzzle && (
                <Link to={`/play/${nextPuzzle.id}`} className={styles.winLink}>
                  <Button>Следующий уровень</Button>
                </Link>
              )}
              {showNextInfiniteWave && infiniteWave !== undefined && (
                <Link to={`/play/infinite/${infiniteWave + 1}`} className={styles.winLink}>
                  <Button>Следующая волна</Button>
                </Link>
              )}
              {showInfiniteEntry && (
                <Link to={`/play/infinite/${nextInfiniteWave}`} className={styles.winLink}>
                  <Button>Бесконечный режим</Button>
                </Link>
              )}
              <Link to="/" className={styles.winLink}>
                <Button
                  variant={
                    showNextLevel || showNextInfiniteWave || showInfiniteEntry ? 'ghost' : 'primary'
                  }
                >
                  В меню
                </Button>
              </Link>
              <a
                href="https://ch.bayer.by/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.winLink}
              >
                <Button variant="ghost">Узнать о продуктах Bayer</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
