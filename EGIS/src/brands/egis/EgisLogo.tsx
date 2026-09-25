import './EgisLogo.css';
import egisLogoUrl from './assets/egis-logo.svg';

type EgisLogoProps = {
  compact?: boolean;
};

export const EgisLogo = ({ compact = false }: EgisLogoProps) => (
  <div className="egis-logo" data-compact={compact || undefined}>
    <img className="egis-logo__mark" src={egisLogoUrl} alt="Egis" />
    <span className="egis-logo__text">
      <span className="egis-logo__tagline">
        Здоровье.<wbr />
        Качество.<wbr />
        Жизнь.
      </span>
    </span>
  </div>
);
