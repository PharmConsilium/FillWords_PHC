import { BAYER_PRODUCTS_RB } from '../catalog/bayerProducts';

export const TOTAL_BAYER_PRODUCTS = BAYER_PRODUCTS_RB.length;

export const discoverProduct = (
  discovered: readonly string[],
  productName: string,
  productCatalog: readonly string[] = BAYER_PRODUCTS_RB,
): string[] => {
  if (!productCatalog.includes(productName)) {
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
  productCatalog: readonly string[] = BAYER_PRODUCTS_RB,
): { found: number; total: number } => ({
  found: discovered.filter((product) => productCatalog.includes(product)).length,
  total: productCatalog.length,
});
