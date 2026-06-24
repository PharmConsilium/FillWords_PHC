import { useEffect } from 'react';
import { getProductInfo } from '../../domain/catalog/bayerProductInfo';
import styles from './ProductToast.module.css';

type ProductToastProps = {
  productName: string;
  onDismiss: () => void;
};

export const ProductToast = ({ productName, onDismiss }: ProductToastProps) => {
  const info = getProductInfo(productName);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss, productName]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <p className={styles.label}>Препарат Bayer</p>
      <p className={styles.name}>{productName}</p>
      <p className={styles.tagline}>{info.tagline}</p>
      <a
        href="https://ch.bayer.by/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Подробнее на ch.bayer.by
      </a>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Закрыть">
        ×
      </button>
    </div>
  );
};
