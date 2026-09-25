import { BAYER_PRODUCT_INFO, getProductInfo } from '../../domain/catalog/bayerProductInfo';
import { BAYER_PRODUCTS_RB } from '../../domain/catalog/bayerProducts';
import { NEUTRAL_WORDS } from '../../domain/catalog/neutralWords';
import { puzzles, puzzlesById } from '../../domain/puzzle/puzzles';
import { BayerLogo } from '../../shared/ui/BayerLogo/BayerLogo';
import type { BrandConfig } from '../types';

export const bayerConfig: BrandConfig = {
  key: 'bayer',
  basePath: '/bayer',
  storageKey: 'fillwords-bayer-progress-v1',
  companyName: 'Bayer',
  collectionTitle: 'Коллекция Bayer',
  collectionHint: 'Найдите препараты Bayer в уровнях — они попадут в коллекцию.',
  productLabel: 'Препарат Bayer',
  gameTitle: 'Филворды',
  tagline: 'Science for a better life',
  subtitle:
    'Найдите на сетке названия препаратов Bayer и слова о здоровье и жизни. Соединяйте соседние буквы линией — вверх, вниз, влево, вправо; путь может изгибаться.',
  winText: 'Вы нашли все слова на этом уровне. Science for a better life.',
  siteUrl: 'https://ch.bayer.by/',
  siteLabel: 'Bayer Consumer Health в Беларуси',
  footerSlogan: 'Здоровье — в ваших руках',
  products: BAYER_PRODUCTS_RB,
  neutralWords: NEUTRAL_WORDS,
  wordPool: [...BAYER_PRODUCTS_RB, ...NEUTRAL_WORDS],
  puzzles,
  puzzlesById,
  getProductInfo: (productName) => BAYER_PRODUCT_INFO[productName] ?? getProductInfo(productName),
  Logo: BayerLogo,
};
