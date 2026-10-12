import type { Transaction } from '@/models/Transaction';

import { sortTransactions } from './sortTransactions';

export type FilterByRecipientCriteria = {
  recipientId: string;
  displayName: string;
};

function recipientNamesMatch(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function filterTransactionsByRecipient(
  txs: Transaction[],
  { recipientId, displayName }: FilterByRecipientCriteria,
): Transaction[] {
  const matched = txs.filter(
    (tx) =>
      tx.recipientId === recipientId ||
      recipientNamesMatch(tx.recipientName, displayName),
  );
  return sortTransactions(matched);
}
