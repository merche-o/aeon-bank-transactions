import type { Transaction } from '@/models/Transaction';

function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Promotes scheduled transactions whose scheduledFor (YYYY-MM-DD) is on or before today (UTC).
 * Sets status to completed and transferDate to scheduledFor.
 */
export function promoteDueScheduledTransactions(
  txs: Transaction[],
  now: Date = new Date(),
): Transaction[] {
  const today = utcDateString(now);

  return txs.map((tx) => {
    if (tx.status !== 'scheduled' || !tx.scheduledFor) {
      return tx;
    }
    const dueDate = tx.scheduledFor.slice(0, 10);
    if (dueDate > today) {
      return tx;
    }
    return {
      ...tx,
      status: 'completed',
      transferDate: tx.scheduledFor,
    };
  });
}

export function transactionWasPromoted(
  before: Transaction,
  after: Transaction,
): boolean {
  return before.status === 'scheduled' && after.status === 'completed';
}
