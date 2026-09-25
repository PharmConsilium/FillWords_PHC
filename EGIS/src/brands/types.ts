import type { ComponentType } from 'react';
import type { PuzzleDefinition } from '../domain/puzzle/types';

export type BrandKey = 'bayer' | 'egis';

export type BrandProductInfo = {
  tagline: string;
};

export type BrandConfig = {
  key: BrandKey;
  basePath: string;
  storageKey: string;
  companyName: string;
  collectionTitle: string;
  collectionHint: string;
  productLabel: string;
  gameTitle: string;
  tagline: string;
  subtitle: string;
  winText: string;
  siteUrl: string;
  siteLabel: string;
  footerSlogan: string;
  products: readonly string[];
  neutralWords: readonly string[];
  wordPool: readonly string[];
  puzzles: PuzzleDefinition[];
  puzzlesById: Record<string, PuzzleDefinition>;
  getProductInfo: (productName: string) => BrandProductInfo;
  Logo: ComponentType<{ compact?: boolean }>;
};
