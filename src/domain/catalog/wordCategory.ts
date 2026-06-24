import { BAYER_PRODUCTS_RB } from './bayerProducts';
import { NEUTRAL_WORDS } from './neutralWords';
import { wordLetters } from './wordLetters';

export type WordCategory = 'bayer' | 'neutral';

const neutralLetterSet = new Set(NEUTRAL_WORDS.map(wordLetters));
const bayerLetterSet = new Set(BAYER_PRODUCTS_RB.map(wordLetters));

export const categorizeWord = (word: string): WordCategory => {
  const letters = wordLetters(word);
  if (neutralLetterSet.has(letters)) {
    return 'neutral';
  }
  if (bayerLetterSet.has(letters)) {
    return 'bayer';
  }
  return 'bayer';
};
