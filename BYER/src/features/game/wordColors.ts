export const WORD_HIGHLIGHT_COLORS = [
  '#89d329',
  '#00a0e4',
  '#00bcff',
  '#f5a623',
  '#e94b7a',
  '#7b61ff',
  '#2ec4b6',
  '#ff6b35',
  '#4d96ff',
  '#06d6a0',
] as const;

export const wordHighlightColor = (index: number): string =>
  WORD_HIGHLIGHT_COLORS[index % WORD_HIGHLIGHT_COLORS.length]!;
