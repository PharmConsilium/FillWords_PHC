import type { BrandConfig } from '../types';
import { EgisLogo } from './EgisLogo';
import { EGIS_NEUTRAL_WORDS } from './neutralWords';
import { EGIS_PRODUCTS_RB } from './products';
import { egisPuzzles, egisPuzzlesById } from './puzzles';
import { getEgisProductInfo } from './productInfo';

export const egisConfig: BrandConfig = {
  key: 'egis',
  basePath: '/egis',
  storageKey: 'fillwords-egis-progress-v1',
  companyName: 'Egis',
  collectionTitle: 'Портфель лекарственных препаратов EGIS в Беларуси',
  collectionHint: 'Найдите названия лекарственных препаратов компании EGIS в филвордах — они попадут в портфель.',
  productLabel: 'Препарат Egis',
  gameTitle: 'Филворды (венгерские кроссворды)',
  tagline: 'Здоровье.Качество.Жизнь.',
  subtitle:
    'Найдите названия лекарственных препаратов компании EGIS. В филворде будут различные слова, связанные с имиджем компании.',
  winText: 'Вы нашли все слова на этом уровне. Здоровье.Качество.Жизнь.',
  siteUrl: 'https://by.egis.health/glavnaya',
  siteLabel: 'EGIS',
  footerSlogan: 'Фармацевтическая разработка, качество и забота о пациентах',
  products: EGIS_PRODUCTS_RB,
  neutralWords: EGIS_NEUTRAL_WORDS,
  wordPool: [...EGIS_PRODUCTS_RB, ...EGIS_NEUTRAL_WORDS],
  puzzles: egisPuzzles,
  puzzlesById: egisPuzzlesById,
  getProductInfo: getEgisProductInfo,
  Logo: EgisLogo,
};
