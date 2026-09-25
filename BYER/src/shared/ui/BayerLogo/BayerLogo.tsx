import bayerLogoMark from './bayer-logo.png';
import './BayerLogo.css';

type BayerLogoProps = {
  compact?: boolean;
};

export const BayerLogo = ({ compact = false }: BayerLogoProps) => (
  <div className="bayer-logo" data-compact={compact || undefined}>
    <img className="bayer-logo__mark" src={bayerLogoMark} alt="Bayer" />
    {!compact && (
      <div className="bayer-logo__text">
        <span className="bayer-logo__brand">Bayer</span>
        <span className="bayer-logo__division">Consumer Health Беларусь</span>
      </div>
    )}
  </div>
);
