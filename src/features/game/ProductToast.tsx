import { useEffect } from 'react';
import type { BrandProductInfo } from '../../brands/types';
import styles from './ProductToast.module.css';

type ProductToastProps = {
  productName: string;
  productLabel: string;
  productInfo: BrandProductInfo;
  siteUrl: string;
  siteLabel: string;
  onDismiss: () => void;
};

export const ProductToast = ({
  productName,
  productLabel,
  productInfo,
  siteUrl,
  siteLabel,
  onDismiss,
}: ProductToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss, productName]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <p className={styles.label}>{productLabel}</p>
      <p className={styles.name}>{productName}</p>
      <p className={styles.tagline}>{productInfo.tagline}</p>
      <a
        href={siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Подробнее: {siteLabel}
      </a>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Закрыть">
        ×
      </button>
    </div>
  );
};
