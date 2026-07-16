import { useParams } from 'react-router-dom';
import { bayerConfig } from './bayer/config';
import { egisConfig } from './egis/config';
import type { BrandConfig, BrandKey } from './types';

const BRAND_KEYS = ['bayer', 'egis'] as const;

export const BRAND_CONFIGS: Record<BrandKey, BrandConfig> = {
  bayer: bayerConfig,
  egis: egisConfig,
};

export const isBrandKey = (value: string | undefined): value is BrandKey =>
  BRAND_KEYS.some((brandKey) => brandKey === value);

const configuredBrandKey = import.meta.env.VITE_BRAND?.toLowerCase();

export const ACTIVE_BRAND_KEY: BrandKey | undefined = isBrandKey(configuredBrandKey)
  ? configuredBrandKey
  : undefined;

export const DEFAULT_BRAND_KEY: BrandKey = ACTIVE_BRAND_KEY ?? 'bayer';

export const isEnabledBrandKey = (value: string | undefined): value is BrandKey =>
  isBrandKey(value) && (ACTIVE_BRAND_KEY === undefined || value === ACTIVE_BRAND_KEY);

export const getBrandConfig = (brandKey: string | undefined): BrandConfig =>
  isEnabledBrandKey(brandKey) ? BRAND_CONFIGS[brandKey] : BRAND_CONFIGS[DEFAULT_BRAND_KEY];

export const useBrandConfig = (): BrandConfig => {
  const { brandKey } = useParams<{ brandKey?: string }>();
  return getBrandConfig(brandKey);
};

export const brandRoute = (brand: BrandConfig, path: string): string =>
  `${brand.basePath}${path.startsWith('/') ? path : `/${path}`}`;
