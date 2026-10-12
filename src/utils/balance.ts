import type { Transaction } from '../models/Transaction';
import { formatCurrency } from './formatCurrency';

function countsTowardBalance(tx: Transaction): boolean {
  const status = tx.status ?? 'completed';
  if (status === 'completed') {
    return true;
  }
  // Pending incoming (e.g. request money) counts toward available balance.
  return status === 'pending' && tx.amount >= 0;
}

export function sumBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (sum, tx) => (countsTowardBalance(tx) ? sum + tx.amount : sum),
    0,
  );
}

/** Outgoing amounts are negative; incoming always affordable. */
export function canAfford(balance: number, amount: number): boolean {
  if (amount >= 0) {
    return true;
  }
  return Math.abs(amount) <= balance + 1e-9;
}

export function getInsufficientFundsMessage(
  balance: number,
  labels: { insufficientFunds: string; availableBalance: string },
): string {
  return `${labels.insufficientFunds} ${labels.availableBalance}: ${formatCurrency(balance)}`;
}
