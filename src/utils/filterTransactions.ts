import type { FilterCriteria, Transaction } from '../models/Transaction';
import { getFlowType } from './transactionType';

function matchesQuery(transaction: Transaction, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const amountText = String(transaction.amount);
  const haystack = [
    transaction.refId,
    transaction.recipientName,
    transaction.transferName,
    amountText,
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

function matchesDateRange(
  transaction: Transaction,
  dateRange: FilterCriteria['dateRange'],
  now: Date,
): boolean {
  if (dateRange === 'all') {
    return true;
  }

  const transferTime = new Date(transaction.transferDate).getTime();
  const days = dateRange === '7d' ? 7 : 30;
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
      matchesDateRange(transaction, criteria.dateRange, now),
  );
}
