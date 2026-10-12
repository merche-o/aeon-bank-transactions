import type { Transaction, TransactionCategory } from '../models/Transaction';

export type BudgetPeriodPreset =
  | 'thisMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'custom';

export interface BudgetRange {
  start: string;
  end: string;
  monthKeys: string[];
}

export interface MonthlySpend {
  monthKey: string; // YYYY-MM
  label: string;
  expenseTotal: number;
  incomeTotal: number;
}

export interface CategorySpend {
  category: TransactionCategory;
  total: number;
  percent: number;
}

export interface MonthTotals {
  income: number;
  expense: number;
  net: number;
}

export interface PeriodChange {
  percent: number | null;
  direction: 'up' | 'down' | 'flat' | 'na';
}

export interface RecipientSpend {
  recipientName: string;
  total: number;
  percent: number;
}

export interface MonthSpendProjection {
  dailyAverage: number;
  projectedMonthEnd: number;
  dayOfMonth: number;
  daysInMonth: number;
}

export interface UpcomingScheduledSummary {
  total: number;
  count: number;
}

export interface BudgetTransactionFilter {
  start: string;
  end: string;
  categories: ReadonlySet<TransactionCategory> | TransactionCategory[];
}

function isCompletedTransaction(tx: Transaction): boolean {
  const status = tx.status ?? 'completed';
  if (status === 'completed') {
    return true;
  }
  // Pending incoming (request money) counts toward budget income.
  return status === 'pending' && tx.amount >= 0;
}

function categorySetIncludes(
  categories: ReadonlySet<TransactionCategory> | TransactionCategory[],
  category: TransactionCategory,
): boolean {
  if (categories instanceof Set || (typeof categories === 'object' && 'has' in categories)) {
    return (categories as ReadonlySet<TransactionCategory>).has(category);
  }
  return categories.includes(category);
}

function utcMonthStart(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0, 0));
}

function utcMonthEnd(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0, 23, 59, 59, 999));
}

function isoStartOfMonth(year: number, monthIndex0: number): string {
  return utcMonthStart(year, monthIndex0).toISOString();
}

function isoEndOfMonth(year: number, monthIndex0: number): string {
  return utcMonthEnd(year, monthIndex0).toISOString();
}

function parseMonthKey(key: string): { year: number; monthIndex0: number } {
  const [y, m] = key.split('-');
  return { year: Number(y), monthIndex0: Number(m) - 1 };
}

function monthKeysInclusive(fromKey: string, toKey: string): string[] {
  const from = parseMonthKey(fromKey);
  const to = parseMonthKey(toKey);
  const keys: string[] = [];
  let y = from.year;
  let m = from.monthIndex0;
  const endY = to.year;
  const endM = to.monthIndex0;

  while (y < endY || (y === endY && m <= endM)) {
    keys.push(`${y}-${String(m + 1).padStart(2, '0')}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return keys;
}

function monthKeyFromUtcDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function toMonthKey(iso: string): string {
  return monthKeyFromUtcDate(new Date(iso));
}

function monthLabelFromKey(key: string): string {
  const { year, monthIndex0 } = parseMonthKey(key);
  return new Date(Date.UTC(year, monthIndex0, 1)).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function shiftUtcMonths(year: number, monthIndex0: number, delta: number): { year: number; monthIndex0: number } {
  const d = new Date(Date.UTC(year, monthIndex0 + delta, 1));
  return { year: d.getUTCFullYear(), monthIndex0: d.getUTCMonth() };
}

function utcStartOfCalendarDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  );
}

function utcEndOfCalendarDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
  );
}

export function resolveBudgetRange(
  preset: BudgetPeriodPreset,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date(),
): BudgetRange {
  if (preset === 'custom') {
    if (!customStart || !customEnd) {
      throw new Error('custom preset requires customStart and customEnd');
    }
    let startDate = new Date(customStart);
    let endDate = new Date(customEnd);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error('custom preset requires valid dates');
    }
    if (startDate.getTime() > endDate.getTime()) {
      const swap = startDate;
      startDate = endDate;
      endDate = swap;
    }

    const startBound = utcStartOfCalendarDay(startDate);
    const endBound = utcEndOfCalendarDay(endDate);
    const firstKey = monthKeyFromUtcDate(startBound);
    const lastKey = monthKeyFromUtcDate(endBound);

    return {
      start: startBound.toISOString(),
      end: endBound.toISOString(),
      monthKeys: monthKeysInclusive(firstKey, lastKey),
    };
  }

  const nowY = now.getUTCFullYear();
  const nowM = now.getUTCMonth();

  let startY = nowY;
  let startM = nowM;
  let endY = nowY;
  let endM = nowM;

  switch (preset) {
    case 'thisMonth':
      break;
    case 'lastMonth': {
      const shifted = shiftUtcMonths(nowY, nowM, -1);
      startY = shifted.year;
      startM = shifted.monthIndex0;
      endY = shifted.year;
      endM = shifted.monthIndex0;
      break;
    }
    case 'last3Months': {
      const shifted = shiftUtcMonths(nowY, nowM, -2);
      startY = shifted.year;
      startM = shifted.monthIndex0;
      break;
    }
    case 'last6Months': {
      const shifted = shiftUtcMonths(nowY, nowM, -5);
      startY = shifted.year;
      startM = shifted.monthIndex0;
      break;
    }
    default: {
      const _exhaustive: never = preset;
      throw new Error(`Unknown preset: ${String(_exhaustive)}`);
    }
  }

  const firstKey = monthKeyFromUtcDate(utcMonthStart(startY, startM));
  const lastKey = monthKeyFromUtcDate(utcMonthStart(endY, endM));
  const monthKeys = monthKeysInclusive(firstKey, lastKey);

  return {
    start: isoStartOfMonth(startY, startM),
    end: isoEndOfMonth(endY, endM),
    monthKeys,
  };
}

export function priorRangeOfEqualLength(range: BudgetRange): BudgetRange {
  const n = range.monthKeys.length;
  if (n === 0) {
    return { start: range.start, end: range.end, monthKeys: [] };
  }

  const first = parseMonthKey(range.monthKeys[0]);
  const priorEnd = shiftUtcMonths(first.year, first.monthIndex0, -1);
  const priorStart = shiftUtcMonths(priorEnd.year, priorEnd.monthIndex0, -(n - 1));

  const monthKeys = monthKeysInclusive(
    monthKeyFromUtcDate(utcMonthStart(priorStart.year, priorStart.monthIndex0)),
    monthKeyFromUtcDate(utcMonthStart(priorEnd.year, priorEnd.monthIndex0)),
  );

  return {
    start: isoStartOfMonth(priorStart.year, priorStart.monthIndex0),
    end: isoEndOfMonth(priorEnd.year, priorEnd.monthIndex0),
    monthKeys,
  };
}

function isDateInInclusiveRange(iso: string, start: string, end: string): boolean {
  const t = new Date(iso).getTime();
  return t >= new Date(start).getTime() && t <= new Date(end).getTime();
}

export function filterBudgetTransactions(
  txs: Transaction[],
  filter: BudgetTransactionFilter,
): Transaction[] {
  const { start, end, categories } = filter;
  return txs.filter(
    (tx) =>
      isCompletedTransaction(tx) &&
      isDateInInclusiveRange(tx.transferDate, start, end) &&
      categorySetIncludes(categories, tx.category),
  );
}

export function aggregateMonthTotals(txs: Transaction[]): MonthTotals {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    if (tx.amount < 0) {
      expense += Math.abs(tx.amount);
    } else {
      income += tx.amount;
    }
  }
  return { income, expense, net: income - expense };
}

export function periodOverPeriodChange(
  currentExpense: number,
  priorExpense: number,
): PeriodChange {
  if (priorExpense === 0) {
    return { percent: null, direction: 'na' };
  }
  const percent = ((currentExpense - priorExpense) / priorExpense) * 100;
  if (currentExpense > priorExpense) {
    return { percent, direction: 'up' };
  }
  if (currentExpense < priorExpense) {
    return { percent, direction: 'down' };
  }
  return { percent: 0, direction: 'flat' };
}

function buildMonthlySpendRow(
  key: string,
  expenseTotal: number,
  incomeTotal: number,
): MonthlySpend {
  return {
    monthKey: key,
    label: monthLabelFromKey(key),
    expenseTotal,
    incomeTotal,
  };
}

function aggregateMonthlySpendFromKeys(
  transactions: Transaction[],
  monthKeys: string[],
): MonthlySpend[] {
  const map = new Map<string, { expenseTotal: number; incomeTotal: number }>();

  for (const tx of transactions) {
    const key = toMonthKey(tx.transferDate);
    const entry = map.get(key) ?? { expenseTotal: 0, incomeTotal: 0 };
    if (tx.amount < 0) {
      entry.expenseTotal += Math.abs(tx.amount);
    } else {
      entry.incomeTotal += tx.amount;
    }
    map.set(key, entry);
  }

  return monthKeys.map((key) => {
    const entry = map.get(key) ?? { expenseTotal: 0, incomeTotal: 0 };
    return buildMonthlySpendRow(key, entry.expenseTotal, entry.incomeTotal);
  });
}

function aggregateMonthlySpendLegacy(
  transactions: Transaction[],
  monthCount: number,
): MonthlySpend[] {
  const map = new Map<string, { expenseTotal: number; incomeTotal: number }>();

  for (const tx of transactions) {
    const key = toMonthKey(tx.transferDate);
    const entry = map.get(key) ?? { expenseTotal: 0, incomeTotal: 0 };
    if (tx.amount < 0) {
      entry.expenseTotal += Math.abs(tx.amount);
    } else {
      entry.incomeTotal += tx.amount;
    }
    map.set(key, entry);
  }

  const keys = [...map.keys()].sort().slice(-monthCount);
  return keys.map((key) => {
    const entry = map.get(key)!;
    return buildMonthlySpendRow(key, entry.expenseTotal, entry.incomeTotal);
  });
}

export function aggregateMonthlySpend(
  transactions: Transaction[],
  monthKeys: string[],
): MonthlySpend[];
export function aggregateMonthlySpend(
  transactions: Transaction[],
  monthCount?: number,
): MonthlySpend[];
export function aggregateMonthlySpend(
  transactions: Transaction[],
  monthKeysOrCount: string[] | number = 6,
): MonthlySpend[] {
  if (Array.isArray(monthKeysOrCount)) {
    return aggregateMonthlySpendFromKeys(transactions, monthKeysOrCount);
  }
  return aggregateMonthlySpendLegacy(transactions, monthKeysOrCount);
}

const DEFAULT_CATEGORY_SLICE_LIMIT = 4;

/**
 * Aggregate outgoing spend by category. When more than `maxSlices` categories
 * exist, keep the top (maxSlices - 1) and roll the rest into `other`.
 */
export function aggregateCategorySpend(
  transactions: Transaction[],
  monthKeyFilter?: string,
  maxSlices: number = DEFAULT_CATEGORY_SLICE_LIMIT + 1,
): CategorySpend[] {
  const map = new Map<TransactionCategory, number>();

  for (const tx of transactions) {
    if (tx.amount >= 0) {
      continue;
    }
    if (monthKeyFilter && toMonthKey(tx.transferDate) !== monthKeyFilter) {
      continue;
    }
    map.set(tx.category, (map.get(tx.category) ?? 0) + Math.abs(tx.amount));
  }

  const rows = [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const capped = collapseCategorySpendTail(rows, maxSlices);
  const expenseGrandTotal = capped.reduce((sum, r) => sum + r.total, 0);
  return capped.map(({ category, total }) => ({
    category,
    total,
    percent: expenseGrandTotal === 0 ? 0 : (total / expenseGrandTotal) * 100,
  }));
}

export function collapseCategorySpendTail(
  rows: Array<{ category: TransactionCategory; total: number }>,
  maxSlices: number = DEFAULT_CATEGORY_SLICE_LIMIT + 1,
): Array<{ category: TransactionCategory; total: number }> {
  if (rows.length <= maxSlices || maxSlices < 2) {
    return rows;
  }

  const keepCount = maxSlices - 1;
  const nonOther = rows.filter((row) => row.category !== 'other');
  const head = nonOther.slice(0, keepCount);
  const headCategories = new Set(head.map((row) => row.category));
  const otherTotal = rows
    .filter((row) => !headCategories.has(row.category))
    .reduce((sum, row) => sum + row.total, 0);

  if (otherTotal <= 0) {
    return head;
  }

  return [...head, { category: 'other' as const, total: otherTotal }].sort(
    (a, b) => b.total - a.total,
  );
}

export type CounterpartyDirection = 'out' | 'in';

export function aggregateTopCounterparties(
  txs: Transaction[],
  limit = 5,
  direction: CounterpartyDirection = 'out',
): RecipientSpend[] {
  const map = new Map<string, number>();

  for (const tx of txs) {
    if (direction === 'out') {
      if (tx.amount >= 0) {
        continue;
      }
      map.set(tx.recipientName, (map.get(tx.recipientName) ?? 0) + Math.abs(tx.amount));
    } else {
      if (tx.amount <= 0) {
        continue;
      }
      map.set(tx.recipientName, (map.get(tx.recipientName) ?? 0) + tx.amount);
    }
  }

  const allRows = [...map.entries()]
    .map(([recipientName, total]) => ({ recipientName, total }))
    .sort((a, b) => b.total - a.total);

  const grandTotal = allRows.reduce((sum, r) => sum + r.total, 0);
  return allRows.slice(0, limit).map(({ recipientName, total }) => ({
    recipientName,
    total,
    percent: grandTotal === 0 ? 0 : (total / grandTotal) * 100,
  }));
}

/** @deprecated Prefer aggregateTopCounterparties(txs, limit, 'out') */
export function aggregateTopRecipients(
  txs: Transaction[],
  limit = 5,
): RecipientSpend[] {
  return aggregateTopCounterparties(txs, limit, 'out');
}

export function projectMonthSpend(spentToDate: number, now: Date = new Date()): MonthSpendProjection {
  const year = now.getUTCFullYear();
  const monthIndex0 = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
  const dayOfMonth = now.getUTCDate();
  const dailyAverage = dayOfMonth > 0 ? spentToDate / dayOfMonth : 0;
  const projectedMonthEnd = dailyAverage * daysInMonth;

  return { dailyAverage, projectedMonthEnd, dayOfMonth, daysInMonth };
}

export function sumUpcomingScheduled(
  txs: Transaction[],
  start: string,
  end: string,
): UpcomingScheduledSummary {
  let total = 0;
  let count = 0;

  for (const tx of txs) {
    if (tx.status !== 'scheduled' || tx.amount >= 0) {
      continue;
    }
    const when = tx.scheduledFor ?? tx.transferDate;
    if (!isDateInInclusiveRange(when, start, end)) {
      continue;
    }
    total += Math.abs(tx.amount);
    count += 1;
  }

  return { total, count };
}
