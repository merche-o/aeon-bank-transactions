import type { Transaction } from '../models/Transaction';
import { formatCurrency } from './formatCurrency';

function statusOf(tx: Transaction): string {
  return tx.status ?? 'completed';
}

/** Completed ledger only — excludes pending income and scheduled/cancelled. */
export function sumBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (statusOf(tx) !== 'completed') {
      return sum;
    }
    return sum + tx.amount;
  }, 0);
}

/** Pending incoming amounts (e.g. open payment requests) — not spendable. */
export function sumPendingIncoming(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    if (statusOf(tx) === 'pending' && tx.amount > 0) {
      return sum + tx.amount;
    }
    return sum;
  }, 0);
}

/**
 * Absolute value of scheduled outgoing amounts reserved against available
 * balance for affordability checks.
 */
export function sumScheduledOutgoingReserved(
  transactions: Transaction[],
): number {
  return transactions.reduce((sum, tx) => {
    if (statusOf(tx) === 'scheduled' && tx.amount < 0) {
      return sum + Math.abs(tx.amount);
    }
    return sum;
  }, 0);
}

/**
 * Spendable balance: completed ledger minus reserved scheduled outgoings.
 */
export function sumAvailableBalance(transactions: Transaction[]): number {
  return sumBalance(transactions) - sumScheduledOutgoingReserved(transactions);
}

/** Outgoing amounts are negative; incoming always affordable. */
export function canAfford(availableBalance: number, amount: number): boolean {
  if (amount >= 0) {
    return true;
  }
  return Math.abs(amount) <= availableBalance + 1e-9;
}

export function getInsufficientFundsMessage(
  availableBalance: number,
  labels: { insufficientFunds: string; availableBalance: string },
): string {
  return `${labels.insufficientFunds} ${labels.availableBalance}: ${formatCurrency(availableBalance)}`;
}
