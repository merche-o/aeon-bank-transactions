import { getDatabase } from '@/data/sqlite/db';
import type { NewRecipientInput, Recipient } from '@/models/Recipient';

import type { RecipientRepository } from './RecipientRepository';

type Row = {
  id: string;
  display_name: string;
  /** Unencrypted at rest in SQLite — consider SQLCipher for production. */
  account_hint: string | null;
  created_at: string;
};

function mapRow(row: Row): Recipient {
  return {
    id: row.id,
    displayName: row.display_name,
    accountHint: row.account_hint ?? undefined,
    createdAt: row.created_at,
  };
}

export class SqliteRecipientRepository implements RecipientRepository {
  async list(): Promise<Recipient[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      `SELECT * FROM recipients ORDER BY created_at DESC`,
    );
    return rows.map(mapRow);
  }

  async add(input: NewRecipientInput): Promise<Recipient> {
    const db = await getDatabase();
    const id = `R${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO recipients (id, display_name, account_hint, created_at)
       VALUES (?, ?, ?, ?)`,
      [id, input.displayName, input.accountHint ?? null, createdAt],
    );
    return {
      id,
      displayName: input.displayName,
      accountHint: input.accountHint,
      createdAt,
    };
  }

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM recipients WHERE id = ?`, [id]);
  }
}
