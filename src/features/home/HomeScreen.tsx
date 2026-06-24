import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BAYER_PRODUCTS_RB } from '../../domain/catalog/bayerProducts';
import { getProductInfo } from '../../domain/catalog/bayerProductInfo';
import { categorizeWord } from '../../domain/catalog/wordCategory';
import { buildCampaignChapters } from '../../domain/campaign/chapters';
import {
  createDailyPuzzle,
  dailyChallengeTitle,
  dailyGridSize,
} from '../../domain/puzzle/dailyChallenge';
import { formatElapsed } from '../../domain/progress/levelStars';
import { isProductDiscovered } from '../../domain/progress/productCollection';
import { createInfinitePuzzle, infiniteGridSize } from '../../domain/puzzle/infiniteMode';
import { puzzles } from '../../domain/puzzle/puzzles';
import type { PuzzleDefinition } from '../../domain/puzzle/types';
import { Button } from '../../shared/ui/Button/Button';
import { BayerLogo } from '../../shared/ui/BayerLogo/BayerLogo';
import { StarsDisplay } from '../../shared/ui/StarsDisplay/StarsDisplay';
import { useGameProgress } from '../progress/useGameProgress';
import styles from './HomeScreen.module.css';

const LEVEL_ICONS = ['💊', '🧬', '🦠'] as const;

type LevelOrbProps = {
  puzzle: PuzzleDefinition;
  levelIndex: number;
  variant: 'side' | 'center';
  completed: boolean;
  unlocked: boolean;
  isContinue: boolean;
  onSelect?: () => void;
};

const LevelOrb = ({
  puzzle,
  levelIndex,
  variant,
  completed,
  unlocked,
  isContinue,
  onSelect,
}: LevelOrbProps) => {
  const icon = LEVEL_ICONS[levelIndex % LEVEL_ICONS.length];
  const label = completed ? '✓' : String(levelIndex + 1);

  const content = (
    <>
      <div
        className={[
          styles.orbRing,
          completed ? styles.orbRingCompleted : '',
          isContinue && variant === 'center' ? styles.orbRingActive : '',
          !unlocked ? styles.orbRingLocked : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
      <div className={styles.orbInner}>
        <span className={styles.orbIcon} aria-hidden="true">
          {!unlocked ? '🔒' : icon}
        </span>
        <span className={styles.orbLabel}>{unlocked ? label : ''}</span>
      </div>
    </>
  );

  const className = [
    styles.orb,
    styles[`orb${variant === 'center' ? 'Center' : 'Side'}`],
    completed ? styles.orbCompleted : '',
    !unlocked ? styles.orbLocked : '',
    isContinue ? styles.orbContinue : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'center' || !unlocked || !onSelect) {
    return (
      <div className={className} aria-label={`${puzzle.title}, сетка ${puzzle.size.rows}×${puzzle.size.cols}`}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onSelect}
      aria-label={`Перейти к ${puzzle.title}`}
    >
      {content}
    </button>
  );
};

type MapDotProps = {
  levelIndex: number;
  completed: boolean;
  unlocked: boolean;
  isActive: boolean;
  stars?: number;
  onSelect: () => void;
};

const MapDot = ({ levelIndex, completed, unlocked, isActive, stars, onSelect }: MapDotProps) => {
  const className = [
    styles.mapDot,
    completed ? styles.mapDotCompleted : '',
    isActive ? styles.mapDotActive : '',
    unlocked && !completed && !isActive ? styles.mapDotUnlocked : '',
    !unlocked ? styles.mapDotLocked : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = `Уровень ${levelIndex + 1}${completed ? ', пройден' : ''}${isActive ? ', выбран' : ''}${!unlocked ? ', заблокирован' : ''}`;

  if (!unlocked) {
    return (
      <span className={className} aria-label={label} title={label}>
        {levelIndex + 1}
      </span>
    );
  }

  return (
    <button type="button" className={className} onClick={onSelect} aria-label={label} title={label}>
      <span className={styles.mapDotInner}>
        {completed ? '✓' : levelIndex + 1}
      </span>
      {completed && stars !== undefined && stars > 0 && (
        <span className={styles.mapDotStars} aria-hidden="true">
          {'★'.repeat(stars)}
        </span>
      )}
    </button>
  );
};

type InfiniteMapDotProps = {
  unlocked: boolean;
  nextWave: number;
  record: number;
};

const InfiniteMapDot = ({ unlocked, nextWave, record }: InfiniteMapDotProps) => {
  const label = unlocked
    ? `Бесконечный режим, волна ${nextWave}${record > 0 ? `, рекорд ${record}` : ''}`
    : 'Бесконечный режим — откроется после 18-го уровня';

  if (!unlocked) {
    return (
      <span
        className={[styles.mapDot, styles.mapDotLocked, styles.mapDotInfinite].join(' ')}
        aria-label={label}
        title={label}
      >
        ∞
      </span>
    );
  }

  return (
    <Link
      to={`/play/infinite/${nextWave}`}
      className={[styles.mapDot, styles.mapDotInfinite, styles.mapDotUnlocked].join(' ')}
      aria-label={label}
      title={label}
    >
      ∞
    </Link>
  );
};

const CAMPAIGN_CHAPTERS = buildCampaignChapters(puzzles.map((puzzle) => puzzle.size.rows));

export const HomeScreen = () => {
  const {
    completed,
    totalLevels,
    continueLevelId,
    isComplete,
    isUnlocked,
    infiniteUnlocked,
    infiniteWaveCompleted,
    nextInfiniteWave,
    isTodayDailyComplete,
    todayKey,
    starsEarned,
    starsTotal,
    dailyStreak,
    productCollection,
    discoveredProducts,
    getLevelStars,
    getLevelBestTimeMs,
  } = useGameProgress();

  const continueIndex = useMemo(() => {
    const index = puzzles.findIndex((puzzle) => puzzle.id === continueLevelId);
    return index >= 0 ? index : 0;
  }, [continueLevelId]);

  const [viewIndex, setViewIndex] = useState(continueIndex);

  useEffect(() => {
    setViewIndex(continueIndex);
  }, [continueIndex]);

  const activeIndex = Math.min(Math.max(viewIndex, 0), puzzles.length - 1);
  const activePuzzle = puzzles[activeIndex]!;
  const prevPuzzle = activeIndex > 0 ? puzzles[activeIndex - 1] : undefined;
  const nextPuzzle = activeIndex < puzzles.length - 1 ? puzzles[activeIndex + 1] : undefined;

  const activeUnlocked = isUnlocked(activeIndex);
  const activeCompleted = isComplete(activePuzzle.id);
  const campaignProgress = totalLevels > 0 ? (completed / totalLevels) * 100 : 0;

  const previewWords = useMemo(
    () =>
      [...activePuzzle.words].sort((a, b) =>
        (a.label ?? a.text).localeCompare(b.label ?? b.text, 'ru'),
      ),
    [activePuzzle.words],
  );

  const shiftView = (delta: number): void => {
    setViewIndex((prev) => Math.min(Math.max(prev + delta, 0), puzzles.length - 1));
  };

  const nextInfinitePuzzle = useMemo(
    () => (infiniteUnlocked ? createInfinitePuzzle(nextInfiniteWave) : undefined),
    [infiniteUnlocked, nextInfiniteWave],
  );

  const dailyPuzzle = useMemo(() => createDailyPuzzle(), [todayKey]);
  const dailyGrid = dailyGridSize();
  const dailyTitle = dailyChallengeTitle();

  const infiniteGrid = infiniteUnlocked ? infiniteGridSize(nextInfiniteWave) : 0;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.logoWrap}>
          <BayerLogo />
        </div>
        <h1 className={styles.gameTitle}>Филворды</h1>
        <p className={styles.tagline}>Science for a better life</p>
        <p className={styles.subtitle}>
          Найдите на сетке названия препаратов Bayer и слова о здоровье и жизни. Соединяйте
          соседние буквы линией — вверх, вниз, влево, вправо; путь может изгибаться, буквой
          «Г» и иначе.
        </p>
      </section>

      <section className={styles.campaign} aria-label="Прогресс кампании">
        <div className={styles.campaignHeader}>
          <span className={styles.campaignLabel}>Пройдено уровней</span>
          <span className={styles.campaignCount}>
            {completed} / {totalLevels}
          </span>
        </div>
        <div className={styles.campaignBar} aria-hidden="true">
          <div className={styles.campaignFill} style={{ width: `${campaignProgress}%` }} />
        </div>
        <p className={styles.starsSummary}>
          Звёзды: <strong>{starsEarned}</strong> / {starsTotal}
        </p>
      </section>

      <section className={styles.daily} aria-label="Челлендж дня">
        <div className={styles.dailyHeader}>
          <h2 className={styles.dailyTitle}>Челлендж дня</h2>
          {isTodayDailyComplete ? (
            <span className={styles.dailyBadge}>Пройден</span>
          ) : (
            <span className={styles.dailyBadgeOpen}>Новый</span>
          )}
        </div>
        <p className={styles.dailyMeta}>
          {dailyTitle} · сетка {dailyGrid}×{dailyGrid} · {dailyPuzzle.words.length} слов · одна
          подсказка
          {dailyStreak > 0 ? ` · серия ${dailyStreak} ${dailyStreak === 1 ? 'день' : dailyStreak < 5 ? 'дня' : 'дней'}` : ''}
        </p>
        <p className={styles.dailyHint}>
          Одна сетка для всех игроков сегодня. Найдите все слова и вернитесь завтра за новым
          челленджем.
        </p>
        <Link to="/play/daily" className={styles.dailyPlay}>
          <Button>{isTodayDailyComplete ? 'Играть снова' : 'Играть челлендж'}</Button>
        </Link>
      </section>

      <section className={styles.levelPath} aria-label="Выбор уровня">
        <div className={styles.pathRow}>
          <div className={styles.pathSlot}>
            {prevPuzzle ? (
              <LevelOrb
                puzzle={prevPuzzle}
                levelIndex={activeIndex - 1}
                variant="side"
                completed={isComplete(prevPuzzle.id)}
                unlocked={isUnlocked(activeIndex - 1)}
                isContinue={prevPuzzle.id === continueLevelId}
                onSelect={() => shiftView(-1)}
              />
            ) : (
              <div className={styles.pathPlaceholder} aria-hidden="true" />
            )}
          </div>

          <div className={styles.pathConnector} aria-hidden="true" />

          <div className={styles.pathSlot}>
            <LevelOrb
              puzzle={activePuzzle}
              levelIndex={activeIndex}
              variant="center"
              completed={activeCompleted}
              unlocked={activeUnlocked}
              isContinue={activePuzzle.id === continueLevelId}
            />
          </div>

          <div className={styles.pathConnector} aria-hidden="true" />

          <div className={styles.pathSlot}>
            {nextPuzzle ? (
              <LevelOrb
                puzzle={nextPuzzle}
                levelIndex={activeIndex + 1}
                variant="side"
                completed={isComplete(nextPuzzle.id)}
                unlocked={isUnlocked(activeIndex + 1)}
                isContinue={nextPuzzle.id === continueLevelId}
                onSelect={
                  isUnlocked(activeIndex + 1) ? () => shiftView(1) : undefined
                }
              />
            ) : (
              <div className={styles.pathPlaceholder} aria-hidden="true" />
            )}
          </div>
        </div>

        <div className={styles.levelDetails}>
          <h2 className={styles.levelTitle}>{activePuzzle.title}</h2>
          <p className={styles.levelMeta}>
            {activePuzzle.words.length} слов · сетка {activePuzzle.size.rows}×
            {activePuzzle.size.cols}
            {activePuzzle.id === continueLevelId && !activeCompleted ? ' · текущий' : ''}
            {activeCompleted ? ' · пройден' : ''}
          </p>

          {activeCompleted && (
            <div className={styles.levelStarsRow}>
              <StarsDisplay stars={getLevelStars(activePuzzle.id)} />
              {getLevelBestTimeMs(activePuzzle.id) !== undefined && (
                <span className={styles.levelBestTime}>
                  Лучшее время: {formatElapsed(getLevelBestTimeMs(activePuzzle.id)!)}
                </span>
              )}
            </div>
          )}

          <div className={styles.wordPreview}>
            <p className={styles.wordPreviewLabel}>Слова на уровне</p>
            <ul className={styles.wordPreviewList}>
              {previewWords.map((word) => {
                const category = categorizeWord(word.text);
                return (
                  <li
                    key={word.id}
                    className={[
                      styles.wordChip,
                      category === 'neutral' ? styles.wordChipNeutral : styles.wordChipBayer,
                    ].join(' ')}
                  >
                    {word.label ?? word.text}
                  </li>
                );
              })}
            </ul>
          </div>

          {activeUnlocked ? (
            <Link to={`/play/${activePuzzle.id}`} className={styles.playLink}>
              <Button>
                {activePuzzle.id === continueLevelId && !activeCompleted
                  ? 'Продолжить'
                  : 'Играть'}
              </Button>
            </Link>
          ) : (
            <p className={styles.lockedHint}>Сначала пройдите предыдущий уровень</p>
          )}
        </div>

        <div className={styles.pathNav}>
          <button
            type="button"
            className={styles.pathNavBtn}
            disabled={activeIndex === 0}
            onClick={() => shiftView(-1)}
            aria-label="Предыдущий уровень"
          >
            ‹
          </button>
          <span className={styles.pathNavLabel}>
            Уровень {activeIndex + 1} из {totalLevels}
          </span>
          <button
            type="button"
            className={styles.pathNavBtn}
            disabled={activeIndex === puzzles.length - 1}
            onClick={() => shiftView(1)}
            aria-label="Следующий уровень"
          >
            ›
          </button>
        </div>
      </section>

      <section className={styles.campaignMap} aria-label="Карта кампании">
        <h2 className={styles.campaignMapTitle}>Карта кампании</h2>
        <p className={styles.campaignMapHint}>
          От 4×4 до 12×12 — нажмите открытый уровень
          {!infiniteUnlocked ? ' · ∞ после 18-го' : ''}
        </p>
        <div className={styles.campaignMapTrack}>
          {CAMPAIGN_CHAPTERS.map((chapter) => (
            <div key={chapter.size} className={styles.campaignChapter}>
              <div className={styles.chapterHeading}>
                <span className={styles.chapterLabel}>
                  {chapter.title} · {chapter.size}×{chapter.size}
                </span>
                {chapter.subtitle && (
                  <span className={styles.chapterSubtitle}>{chapter.subtitle}</span>
                )}
              </div>
              <div className={styles.chapterDots}>
                {chapter.levelIndices.map((levelIndex) => (
                  <MapDot
                    key={puzzles[levelIndex]!.id}
                    levelIndex={levelIndex}
                    completed={isComplete(puzzles[levelIndex]!.id)}
                    unlocked={isUnlocked(levelIndex)}
                    isActive={levelIndex === activeIndex}
                    stars={getLevelStars(puzzles[levelIndex]!.id)}
                    onSelect={() => setViewIndex(levelIndex)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className={styles.campaignChapter}>
            <span className={styles.chapterLabel}>∞</span>
            <div className={styles.chapterDots}>
              <InfiniteMapDot
                unlocked={infiniteUnlocked}
                nextWave={nextInfiniteWave}
                record={infiniteWaveCompleted}
              />
            </div>
          </div>
        </div>

        {infiniteUnlocked && nextInfinitePuzzle && (
          <div className={styles.infiniteMapPanel}>
            <p className={styles.infiniteMapMeta}>
              <strong>Бесконечный режим</strong> · волна {nextInfiniteWave}
              {infiniteWaveCompleted > 0 ? ` · рекорд: ${infiniteWaveCompleted}` : ''}
              {' · сетка '}
              {infiniteGrid}×{infiniteGrid} · {nextInfinitePuzzle.words.length} слов
            </p>
            <Link to={`/play/infinite/${nextInfiniteWave}`} className={styles.infiniteMapPlay}>
              <Button>
                {infiniteWaveCompleted > 0 ? 'Продолжить волны' : 'Начать бесконечный режим'}
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section className={styles.collection} aria-label="Коллекция препаратов">
        <div className={styles.collectionHeader}>
          <h2 className={styles.collectionTitle}>Коллекция Bayer</h2>
          <span className={styles.collectionCount}>
            {productCollection.found} / {productCollection.total}
          </span>
        </div>
        <p className={styles.collectionHint}>
          Найдите препараты Bayer в уровнях — они попадут в коллекцию.
        </p>
        <ul className={styles.collectionList}>
          {BAYER_PRODUCTS_RB.map((product) => {
            const found = isProductDiscovered(discoveredProducts, product);
            return (
              <li
                key={product}
                className={[
                  styles.collectionItem,
                  found ? styles.collectionItemFound : styles.collectionItemLocked,
                ].join(' ')}
                title={found ? getProductInfo(product).tagline : 'Ещё не найден'}
              >
                <span className={styles.collectionName}>{found ? product : '???'}</span>
                {found && (
                  <span className={styles.collectionTagline}>{getProductInfo(product).tagline}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className={styles.footer}>
        <a href="https://ch.bayer.by/" target="_blank" rel="noopener noreferrer">
          Bayer Consumer Health в Беларуси
        </a>
        <span className={styles.slogan}>Здоровье — в ваших руках</span>
      </footer>
    </main>
  );
};
