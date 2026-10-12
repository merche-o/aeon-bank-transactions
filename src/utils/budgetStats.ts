import type { Transaction, TransactionCategory } from '../models/Transaction';
import { isExpenseCategory } from './categories';

export interface MonthlySpend {
  monthKey: string; // YYYY-MM
  label: string;
  expenseTotal: number;
  incomeTotal: number;
}

export interface CategorySpend {
  category: TransactionCategory;
  total: number;
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function aggregateMonthlySpend(
  transactions: Transaction[],
  monthCount: number = 6,
): MonthlySpend[] {
  const map = new Map<string, { expenseTotal: number; incomeTotal: number }>();

  for (const tx of transactions) {
    const key = monthKey(tx.transferDate);
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
    const [y, m] = key.split('-');
    const label = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleDateString(
      'en-GB',
      { month: 'short', year: 'numeric', timeZone: 'UTC' },
    );
    return {
      monthKey: key,
      label,
      expenseTotal: entry.expenseTotal,
      incomeTotal: entry.incomeTotal,
    };
  });
}

export function aggregateCategorySpend(
  transactions: Transaction[],
  monthKeyFilter?: string,
): CategorySpend[] {
  const map = new Map<TransactionCategory, number>();

  for (const tx of transactions) {
    if (tx.amount >= 0) {
      continue;
    }
    if (monthKeyFilter && monthKey(tx.transferDate) !== monthKeyFilter) {
      continue;
    }
    if (!isExpenseCategory(tx.category) && tx.category !== 'other' && tx.category !== 'transfer') {
      continue;
    }
    map.set(tx.category, (map.get(tx.category) ?? 0) + Math.abs(tx.amount));
  }

  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
