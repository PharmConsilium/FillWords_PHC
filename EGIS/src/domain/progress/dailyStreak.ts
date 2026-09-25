const MS_PER_DAY = 86_400_000;

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * MS_PER_DAY);

/** Подряд идущие дни с пройденным челленджем, считая от сегодня или вчера. */
export const calculateDailyStreak = (
  completedDates: readonly string[],
  today: Date = new Date(),
): number => {
  if (completedDates.length === 0) {
    return 0;
  }

  const completed = new Set(completedDates);
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  let cursor: Date;
  if (completed.has(todayKey)) {
    cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  } else if (completed.has(yesterdayKey)) {
    cursor = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), -1);
  } else {
    return 0;
  }

  let streak = 0;
  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const longestDailyStreak = (completedDates: readonly string[]): number => {
  if (completedDates.length === 0) {
    return 0;
  }

  const sorted = [...new Set(completedDates)].sort();
  let best = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const prev = parseDateKey(sorted[index - 1]!);
    const next = parseDateKey(sorted[index]!);
    const diffDays = Math.round((next.getTime() - prev.getTime()) / MS_PER_DAY);

    if (diffDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return best;
};
