import styles from './StarsDisplay.module.css';
import type { LevelStars } from '../../../domain/progress/types';

type StarsDisplayProps = {
  stars: LevelStars | undefined;
  size?: 'sm' | 'md';
};

export const StarsDisplay = ({ stars, size = 'md' }: StarsDisplayProps) => {
  const earned = stars ?? 0;
  return (
    <span
      className={[styles.stars, styles[size]].join(' ')}
      aria-label={earned > 0 ? `${earned} из 3 звёзд` : 'Звёзды не получены'}
    >
      {[1, 2, 3].map((index) => (
        <span
          key={index}
          className={index <= earned ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
};
