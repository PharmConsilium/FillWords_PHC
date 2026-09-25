import { BAYER_PRODUCTS_RB } from './bayerProducts';
import { NEUTRAL_WORDS } from './neutralWords';
import { wordLetters } from './wordLetters';

export type WordCategory = 'bayer' | 'neutral';

export const categorizeWord = (
  word: string,
  products: readonly string[] = BAYER_PRODUCTS_RB,
  neutralWords: readonly string[] = NEUTRAL_WORDS,
): WordCategory => {
  const letters = wordLetters(word);
  const neutralLetterSet = new Set(neutralWords.map(wordLetters));
  const productLetterSet = new Set(products.map(wordLetters));
  if (neutralLetterSet.has(letters)) {
    return 'neutral';
  }
  if (productLetterSet.has(letters)) {
    return 'bayer';
  }
  return 'bayer';
};
