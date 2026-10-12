import type { Transaction } from '../models/Transaction';

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) =>
      new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime(),
  );
}
