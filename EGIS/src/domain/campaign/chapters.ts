export type CampaignChapter = {
  size: number;
  title: string;
  subtitle: string;
  levelIndices: number[];
};

export const CHAPTER_BY_SIZE: Record<number, { title: string; subtitle: string }> = {
  4: { title: 'Старт', subtitle: 'Знакомство с механикой' },
  5: { title: 'Разминка', subtitle: 'Первые шаги' },
  6: { title: 'Уверенность', subtitle: 'Сетка побольше' },
  7: { title: 'Внимание', subtitle: 'Больше слов на поле' },
  8: { title: 'Сосредоточенность', subtitle: 'Средний уровень' },
  9: { title: 'Настойчивость', subtitle: 'Сложнее, но посильно' },
  10: { title: 'Мастерство', subtitle: 'Почти у цели' },
  11: { title: 'Эксперт', subtitle: 'Крупная сетка' },
  12: { title: 'Финал', subtitle: 'Вершина кампании' },
};

export const chapterMeta = (size: number): { title: string; subtitle: string } =>
  CHAPTER_BY_SIZE[size] ?? { title: `Сетка ${size}×${size}`, subtitle: '' };

export const buildCampaignChapters = (
  levelSizes: readonly number[],
): CampaignChapter[] => {
  const chapters: CampaignChapter[] = [];

  for (let index = 0; index < levelSizes.length; index += 1) {
    const size = levelSizes[index]!;
    const last = chapters[chapters.length - 1];
    const meta = chapterMeta(size);

    if (last?.size === size) {
      last.levelIndices.push(index);
    } else {
      chapters.push({
        size,
        title: meta.title,
        subtitle: meta.subtitle,
        levelIndices: [index],
      });
    }
  }

  return chapters;
};
