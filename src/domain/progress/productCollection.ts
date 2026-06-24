import { BAYER_PRODUCTS_RB } from '../catalog/bayerProducts';

export const TOTAL_BAYER_PRODUCTS = BAYER_PRODUCTS_RB.length;

export const discoverProduct = (
  discovered: readonly string[],
  productName: string,
): string[] => {
  if (!(BAYER_PRODUCTS_RB as readonly string[]).includes(productName)) {
    return [...discovered];
  }
  if (discovered.includes(productName)) {
    return [...discovered];
  }
  return [...discovered, productName];
};

export const isProductDiscovered = (
  discovered: readonly string[],
  productName: string,
): boolean => discovered.includes(productName);

export const collectionProgress = (
  discovered: readonly string[],
): { found: number; total: number } => ({
  found: discovered.length,
  total: TOTAL_BAYER_PRODUCTS,
});
