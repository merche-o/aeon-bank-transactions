import type { Locale } from '../i18n/types';
import {
  isTransactionCategory,
  type TransactionCategory,
} from '../models/Transaction';
import { t } from '../i18n';

const EXPENSE_CATEGORIES: ReadonlySet<TransactionCategory> = new Set([
  'food',
  'entertainment',
  'bills',
  'personal',
  'transportation',
]);

export function isExpenseCategory(category: TransactionCategory): boolean {
  return EXPENSE_CATEGORIES.has(category);
}

export function defaultCategoryForAmount(amount: number): TransactionCategory {
  return amount >= 0 ? 'salary' : 'other';
}

/** Normalize legacy / invalid category strings from storage or DTOs. */
export function normalizeTransactionCategory(
  value: string | null | undefined,
): TransactionCategory {
  if (value === 'transfer') {
    return 'transportation';
  }
  if (value && isTransactionCategory(value)) {
    return value;
  }
  return 'unknown';
}

export function getCategoryLabel(
  category: TransactionCategory,
  locale: Locale,
): string {
  return t(`category.${category}`, locale);
}
