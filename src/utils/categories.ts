import type { Locale } from '../i18n/types';
import type { TransactionCategory } from '../models/Transaction';
import { t } from '../i18n';

const EXPENSE_CATEGORIES: ReadonlySet<TransactionCategory> = new Set([
  'food',
  'entertainment',
  'bills',
  'personal',
]);

export function isExpenseCategory(category: TransactionCategory): boolean {
  return EXPENSE_CATEGORIES.has(category);
}

export function defaultCategoryForAmount(amount: number): TransactionCategory {
  return amount >= 0 ? 'salary' : 'other';
}

export function getCategoryLabel(
  category: TransactionCategory,
  locale: Locale,
): string {
  return t(`category.${category}`, locale);
}
