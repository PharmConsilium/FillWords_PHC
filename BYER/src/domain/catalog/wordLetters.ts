/** Буквы слова без пробелов и дефисов — для размещения в сетке. */
export const wordLetters = (word: string): string => word.replace(/[\s-]+/g, '');

export const wordLetterCount = (word: string): number => wordLetters(word).length;
