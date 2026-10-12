import type { FilterCriteria, Transaction } from '../models/Transaction';
import { getFlowType } from './transactionType';

function matchesQuery(transaction: Transaction, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const haystack = [
    transaction.refId,
    transaction.recipientName,
    transaction.transferName,
    transaction.category,
    String(transaction.amount),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesType(
  transaction: Transaction,
  typeFilter: FilterCriteria['type'],
): boolean {
  if (typeFilter === 'all') {
    return true;
  }
  return getFlowType(transaction) === typeFilter;
}

function matchesCategory(
  transaction: Transaction,
  categoryFilter: FilterCriteria['category'],
): boolean {
  if (categoryFilter === 'all') {
    return true;
  }
  return transaction.category === categoryFilter;
}

function matchesDateRange(
  transaction: Transaction,
  criteria: FilterCriteria,
  now: Date,
): boolean {
  const transferTime = new Date(transaction.transferDate).getTime();

  if (criteria.dateRange === 'custom') {
    if (criteria.customStart) {
      const start = new Date(criteria.customStart).getTime();
      if (transferTime < start) {
        return false;
      }
    }
    if (criteria.customEnd) {
      const end = new Date(criteria.customEnd).getTime();
      if (transferTime > end) {
        return false;
      }
    }
    return true;
  }

  if (criteria.dateRange === 'all') {
    return true;
  }

  const days = criteria.dateRange === '7d' ? 7 : 30;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return transferTime >= cutoff && transferTime <= now.getTime();
}

export function filterTransactions(
  transactions: Transaction[],
  criteria: FilterCriteria,
  now: Date = new Date(),
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      matchesQuery(transaction, criteria.query) &&
      matchesType(transaction, criteria.type) &&
      matchesCategory(transaction, criteria.category) &&
      matchesDateRange(transaction, criteria, now),
  );
}
