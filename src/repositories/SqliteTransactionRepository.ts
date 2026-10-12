import { getDatabase } from '../data/sqlite/db';
import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
} from '../models/Transaction';
import { isTransactionCategory } from '../models/Transaction';

import type { TransactionRepository } from './TransactionRepository';

type Row = {
  ref_id: string;
  transfer_date: string;
  recipient_name: string;
  transfer_name: string;
  amount: number;
  category: string;
};

function mapRow(row: Row): Transaction {
  const category = isTransactionCategory(row.category) ? row.category : 'other';
  return {
    refId: row.ref_id,
    transferDate: row.transfer_date,
    recipientName: row.recipient_name,
    transferName: row.transfer_name,
    amount: row.amount,
    category,
  };
}

export class SqliteTransactionRepository implements TransactionRepository {
  async getTransactions(): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      `SELECT * FROM transactions ORDER BY transfer_date DESC`,
    );
    return rows.map(mapRow);
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM transactions WHERE ref_id = ?`,
      [refId],
    );
    return row ? mapRow(row) : null;
  }

  async addTransaction(input: NewTransactionInput): Promise<Transaction> {
    const db = await getDatabase();
    const refId = `NEW${Date.now().toString(36).toUpperCase()}`;
    const created: Transaction = { refId, ...input };
    await db.runAsync(
      `INSERT INTO transactions
        (ref_id, transfer_date, recipient_name, transfer_name, amount, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        created.refId,
        created.transferDate,
        created.recipientName,
        created.transferName,
        created.amount,
        created.category,
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
}
