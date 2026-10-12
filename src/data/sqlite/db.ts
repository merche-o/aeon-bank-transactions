import * as SQLite from 'expo-sqlite';

import { mockTransactionsResponse } from '../mockTransactions';
import { mapTransactionDto } from '../../repositories/mapTransactionDto';

const DB_NAME = 'aeon_transactions.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      ref_id TEXT PRIMARY KEY NOT NULL,
      transfer_date TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      transfer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const seeded = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = ?`,
    ['seeded_v1'],
  );

  if (!seeded) {
    for (const dto of mockTransactionsResponse.data) {
      const tx = mapTransactionDto(dto);
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
          (ref_id, transfer_date, recipient_name, transfer_name, amount, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tx.refId,
          tx.transferDate,
          tx.recipientName,
          tx.transferName,
          tx.amount,
          tx.category,
        ],
      );
    }
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
      ['seeded_v1', '1'],
    );
  }

  return db;
}

export async function resetDatabaseForTests(): Promise<void> {
  dbPromise = null;
}
