import { useParams } from 'react-router-dom';
import { bayerConfig } from './bayer/config';
import type { BrandConfig, BrandKey } from './types';

export const BRAND_CONFIGS: Record<BrandKey, BrandConfig> = {
  bayer: bayerConfig,
};

export const isBrandKey = (value: string | undefined): value is BrandKey => value === 'bayer';

export const DEFAULT_BRAND_KEY: BrandKey = 'bayer';

export const isEnabledBrandKey = (value: string | undefined): value is BrandKey =>
  isBrandKey(value);

export const getBrandConfig = (brandKey: string | undefined): BrandConfig =>
  isEnabledBrandKey(brandKey) ? BRAND_CONFIGS[brandKey] : BRAND_CONFIGS[DEFAULT_BRAND_KEY];

export const useBrandConfig = (): BrandConfig => {
  const { brandKey } = useParams<{ brandKey?: string }>();
  return getBrandConfig(brandKey);
};

export const brandRoute = (brand: BrandConfig, path: string): string =>
  `${brand.basePath}${path.startsWith('/') ? path : `/${path}`}`;
