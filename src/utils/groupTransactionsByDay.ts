import type { Transaction } from '@/models/Transaction';

import {
  formatDayKey,
  formatDaySectionLabel,
  type FormatDateOptions,
} from './formatDate';

export type DaySection = {
  key: string;
  title: string;
  data: Transaction[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface GroupTransactionsByDayOptions extends FormatDateOptions {
  now?: Date;
}

function shouldIncludeYearForDayKey(
  dayKey: string,
  now: Date,
  options?: FormatDateOptions,
): boolean {
  const cutoff = new Date(now.getTime() - 365 * MS_PER_DAY);
  const cutoffKey = formatDayKey(cutoff.toISOString(), options);
  return dayKey < cutoffKey;
}

export function groupTransactionsByDay(
  transactions: Transaction[],
  options?: GroupTransactionsByDayOptions,
): DaySection[] {
  if (transactions.length === 0) {
    return [];
  }

  const now = options?.now ?? new Date();
  const formatOptions: FormatDateOptions = {
    locale: options?.locale,
    timeZone: options?.timeZone,
  };

  const sections: DaySection[] = [];

  for (const transaction of transactions) {
    const key = formatDayKey(transaction.transferDate, formatOptions);
    const last = sections[sections.length - 1];

    if (last != null && last.key === key) {
      last.data.push(transaction);
      continue;
    }

    const includeYear = shouldIncludeYearForDayKey(key, now, formatOptions);
    sections.push({
      key,
      title: formatDaySectionLabel(transaction.transferDate, {
        ...formatOptions,
        includeYear,
      }),
      data: [transaction],
    });
  }

  return sections;
}
