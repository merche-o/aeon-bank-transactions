import * as SQLite from 'expo-sqlite';

import { SEED_RECIPIENTS } from '../recipientSeeds';
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

type TableInfoRow = {
  name: string;
};

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const columns = await db.getAllAsync<TableInfoRow>(
    `PRAGMA table_info(${table})`,
  );
  if (!columns.some((col) => col.name === column)) {
    await db.execAsync(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
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
    CREATE TABLE IF NOT EXISTS recipients (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      account_hint TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payment_requests (
      id TEXT PRIMARY KEY NOT NULL,
      recipient_id TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await addColumnIfMissing(db, 'transactions', 'status', "TEXT DEFAULT 'completed'");
  await addColumnIfMissing(db, 'transactions', 'scheduled_for', 'TEXT');
  await addColumnIfMissing(db, 'transactions', 'recipient_id', 'TEXT');
  await addColumnIfMissing(db, 'payment_requests', 'transfer_name', 'TEXT');
  await addColumnIfMissing(
    db,
    'payment_requests',
    'category',
    "TEXT DEFAULT 'transfer'",
  );

  const seeded = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = ?`,
    ['seeded_v1'],
  );

  if (!seeded) {
    for (const dto of mockTransactionsResponse.data) {
      const tx = mapTransactionDto(dto);
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
          (ref_id, transfer_date, recipient_name, transfer_name, amount, category, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.refId,
          tx.transferDate,
          tx.recipientName,
          tx.transferName,
          tx.amount,
          tx.category,
          tx.status,
        ],
      );
    }
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
      ['seeded_v1', '1'],
    );
  }

  const recipientsSeeded = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = ?`,
    ['seeded_recipients_v1'],
  );

  if (!recipientsSeeded) {
    for (const recipient of SEED_RECIPIENTS) {
      await db.runAsync(
        `INSERT OR REPLACE INTO recipients
          (id, display_name, account_hint, created_at)
         VALUES (?, ?, ?, ?)`,
        [
          recipient.id,
          recipient.displayName,
          recipient.accountHint ?? null,
          recipient.createdAt,
        ],
      );
    }
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`,
      ['seeded_recipients_v1', '1'],
    );
  }

  return db;
}

export async function resetDatabaseForTests(): Promise<void> {
  dbPromise = null;
}
