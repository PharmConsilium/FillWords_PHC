import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandRoute, useBrandConfig } from '../../brands';
import { categorizeWord } from '../../domain/catalog/wordCategory';
import { buildCampaignChapters } from '../../domain/campaign/chapters';
import { formatElapsed } from '../../domain/progress/levelStars';
import { isProductDiscovered } from '../../domain/progress/productCollection';
import { createInfinitePuzzle, infiniteGridSize } from '../../domain/puzzle/infiniteMode';
import { Button } from '../../shared/ui/Button/Button';
import { StarsDisplay } from '../../shared/ui/StarsDisplay/StarsDisplay';
import { useGameProgress } from '../progress/useGameProgress';
import styles from './HomeScreen.module.css';

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
  basePath: string;
  unlocked: boolean;
  nextWave: number;
  record: number;
};

const InfiniteMapDot = ({ basePath, unlocked, nextWave, record }: InfiniteMapDotProps) => {
  const label = unlocked
    ? `Бесконечный режим, волна ${nextWave}${record > 0 ? `, рекорд ${record}` : ''}`
    : 'Бесконечный режим — откроется после 18-го уровня';

  if (!unlocked) {
    return (
      <>
        <span
          className={[styles.mapDot, styles.mapDotLocked, styles.mapDotInfinite].join(' ')}
          aria-label={label}
          title={label}
        >
          ∞
        </span>
        <span className={styles.infiniteWaveBadge}>Волн пройдено: {record}</span>
      </>
    );
  }

  return (
    <>
      <Link
        to={`${basePath}/play/infinite/${nextWave}`}
        className={[styles.mapDot, styles.mapDotInfinite, styles.mapDotUnlocked].join(' ')}
        aria-label={label}
        title={label}
      >
        ∞
      </Link>
      <span className={styles.infiniteWaveBadge}>Волн пройдено: {record}</span>
    </>
  );
};

export const HomeScreen = () => {
  const brand = useBrandConfig();
  const puzzles = brand.puzzles;
  const Logo = brand.Logo;
  const {
    completed,
    totalLevels,
    continueLevelId,
    isComplete,
    isUnlocked,
    infiniteUnlocked,
    infiniteWaveCompleted,
    nextInfiniteWave,
    starsEarned,
    starsTotal,
    productCollection,
    discoveredProducts,
    getLevelStars,
    getLevelBestTimeMs,
  } = useGameProgress({
    puzzles,
    storageKey: brand.storageKey,
    productCatalog: brand.products,
  });

  const campaignChapters = useMemo(
    () => buildCampaignChapters(puzzles.map((puzzle) => puzzle.size.rows)),
    [puzzles],
  );

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
    () => (infiniteUnlocked ? createInfinitePuzzle(nextInfiniteWave, brand.wordPool) : undefined),
    [brand.wordPool, infiniteUnlocked, nextInfiniteWave],
  );

  const infiniteGrid = infiniteUnlocked ? infiniteGridSize(nextInfiniteWave) : 0;

  return (
    <main className={styles.page} data-brand={brand.key}>
      <section className={styles.hero}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>
        <h1 className={styles.gameTitle}>{brand.gameTitle}</h1>
      </section>

      <p className={styles.subtitle}>{brand.subtitle}</p>

      <section className={styles.levelPath} aria-label="Выбор уровня">
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
                const category = categorizeWord(word.text, brand.products, brand.neutralWords);
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
            <Link to={brandRoute(brand, `/play/${activePuzzle.id}`)} className={styles.playLink}>
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

      <details className={styles.campaignMap}>
        <summary className={styles.campaignMapSummary}>
          <span className={styles.campaignMapTitle}>Карта филвордов</span>
          <span className={styles.campaignMapToggle}>Развернуть</span>
        </summary>
        <div className={styles.campaignMapBody}>
          <p className={styles.campaignMapHint}>
            От 4×4 до 12×12 — нажмите открытый уровень
            {!infiniteUnlocked ? ' · ∞ после 18-го' : ''}
          </p>
        <div className={styles.campaignMapTrack}>
          {campaignChapters.map((chapter) => (
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
          <div className={[styles.campaignChapter, styles.infiniteChapter].join(' ')}>
            <div className={styles.chapterHeading}>
              <span className={styles.chapterLabel}>Бесконечный режим</span>
            </div>
            <div className={styles.chapterDots}>
              <InfiniteMapDot
                basePath={brand.basePath}
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
            <Link to={brandRoute(brand, `/play/infinite/${nextInfiniteWave}`)} className={styles.infiniteMapPlay}>
              <Button>
                {infiniteWaveCompleted > 0 ? 'Продолжить волны' : 'Начать бесконечный режим'}
              </Button>
            </Link>
          </div>
        )}
        </div>
      </details>

      <section className={styles.collection} aria-label="Коллекция препаратов">
        <div className={styles.collectionHeader}>
          <h2 className={styles.collectionTitle}>{brand.collectionTitle}</h2>
          <span className={styles.collectionCount}>
            {productCollection.found} / {productCollection.total}
          </span>
        </div>
        <p className={styles.collectionHint}>
          {brand.collectionHint}
        </p>
        <ul className={styles.collectionList}>
          {brand.products.map((product) => {
            const found = isProductDiscovered(discoveredProducts, product);
            return (
              <li
                key={product}
                className={[
                  styles.collectionItem,
                  found ? styles.collectionItemFound : styles.collectionItemLocked,
                ].join(' ')}
                title={found ? brand.getProductInfo(product).tagline : 'Ещё не найден'}
              >
                <span className={styles.collectionName}>{found ? product : '???'}</span>
                {found && (
                  <span className={styles.collectionTagline}>{brand.getProductInfo(product).tagline}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className={styles.footer}>
        <a href={brand.siteUrl} target="_blank" rel="noopener noreferrer">
          <Logo compact />
        </a>
      </footer>
    </main>
  );
};
