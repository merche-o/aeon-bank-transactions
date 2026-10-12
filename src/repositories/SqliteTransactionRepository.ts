import { getDatabase } from '../data/sqlite/db';
import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionStatus,
} from '../models/Transaction';
import {
  promoteDueScheduledTransactions,
  transactionWasPromoted,
} from '../utils/schedule';
import { normalizeTransactionCategory } from '../utils/categories';

import type { TransactionRepository } from './TransactionRepository';
import { transactionFromInput } from './transactionFromInput';

type Row = {
  ref_id: string;
  transfer_date: string;
  recipient_name: string;
  transfer_name: string;
  amount: number;
  category: string;
  status: string | null;
  scheduled_for: string | null;
  recipient_id: string | null;
  payment_request_id: string | null;
};

function parseStatus(value: string | null): TransactionStatus {
  if (
    value === 'scheduled' ||
    value === 'cancelled' ||
    value === 'completed' ||
    value === 'pending'
  ) {
    return value;
  }
  return 'completed';
}

function mapRow(row: Row): Transaction {
  const category = normalizeTransactionCategory(row.category);
  return {
    refId: row.ref_id,
    transferDate: row.transfer_date,
    recipientName: row.recipient_name,
    transferName: row.transfer_name,
    amount: row.amount,
    category,
    status: parseStatus(row.status),
    scheduledFor: row.scheduled_for ?? undefined,
    recipientId: row.recipient_id ?? undefined,
    paymentRequestId: row.payment_request_id ?? undefined,
  };
}

async function persistPromotion(tx: Transaction): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE transactions SET status = ?, transfer_date = ? WHERE ref_id = ?`,
    [tx.status, tx.transferDate, tx.refId],
  );
}

export class SqliteTransactionRepository implements TransactionRepository {
  private async loadAndPromote(): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      `SELECT * FROM transactions ORDER BY transfer_date DESC`,
    );
    const mapped = rows.map(mapRow);
    const promoted = promoteDueScheduledTransactions(mapped);
    for (let i = 0; i < mapped.length; i += 1) {
      const before = mapped[i];
      const after = promoted[i];
      if (before && after && transactionWasPromoted(before, after)) {
        await persistPromotion(after);
      }
    }
    return promoted;
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.loadAndPromote();
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM transactions WHERE ref_id = ?`,
      [refId],
    );
    if (!row) {
      return null;
    }
    const mapped = mapRow(row);
    const [promoted] = promoteDueScheduledTransactions([mapped]);
    if (promoted && transactionWasPromoted(mapped, promoted)) {
      await persistPromotion(promoted);
    }
    return promoted ?? mapped;
  }

  async addTransaction(input: NewTransactionInput): Promise<Transaction> {
    const db = await getDatabase();
    const refId = `NEW${Date.now().toString(36).toUpperCase()}`;
    const created = transactionFromInput(refId, input);
    await db.runAsync(
      `INSERT INTO transactions
        (ref_id, transfer_date, recipient_name, transfer_name, amount, category, status, scheduled_for, recipient_id, payment_request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        created.refId,
        created.transferDate,
        created.recipientName,
        created.transferName,
        created.amount,
        created.category,
        created.status,
        created.scheduledFor ?? null,
        created.recipientId ?? null,
        created.paymentRequestId ?? null,
      ],
    );
    return created;
  }

  async updateTransactionCategory(
    refId: string,
    category: TransactionCategory,
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE transactions SET category = ? WHERE ref_id = ?`, [
      category,
      refId,
    ]);
  }

  async updateTransactionStatus(
    refId: string,
    status: TransactionStatus,
  ): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM transactions WHERE ref_id = ?`,
      [refId],
    );
    if (!row) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    await db.runAsync(`UPDATE transactions SET status = ? WHERE ref_id = ?`, [
      status,
      refId,
    ]);
  }

  async cancelScheduledTransaction(refId: string): Promise<void> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM transactions WHERE ref_id = ?`,
      [refId],
    );
    if (!row) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    const tx = mapRow(row);
    if (tx.status !== 'scheduled') {
      throw new Error('TRANSACTION_NOT_SCHEDULED');
    }
    await db.runAsync(`UPDATE transactions SET status = ? WHERE ref_id = ?`, [
      'cancelled',
      refId,
    ]);
  }
}
