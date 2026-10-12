import { getDatabase } from '@/data/sqlite/db';
import type {
  NewPaymentRequestInput,
  PaymentRequest,
  PaymentRequestStatus,
} from '@/models/PaymentRequest';
import { normalizeTransactionCategory } from '@/utils/categories';

import type { PaymentRequestRepository } from './PaymentRequestRepository';

type Row = {
  id: string;
  recipient_id: string;
  amount: number;
  note: string | null;
  transfer_name: string | null;
  category: string | null;
  status: string;
  created_at: string;
};

function parseStatus(value: string): PaymentRequestStatus {
  if (value === 'paid' || value === 'cancelled' || value === 'pending') {
    return value;
  }
  return 'pending';
}

function mapRow(row: Row): PaymentRequest {
  const category = normalizeTransactionCategory(row.category ?? 'unknown');
  return {
    id: row.id,
    recipientId: row.recipient_id,
    amount: row.amount,
    note: row.note ?? undefined,
    transferName: row.transfer_name ?? undefined,
    category,
    status: parseStatus(row.status),
    createdAt: row.created_at,
  };
}

export class SqlitePaymentRequestRepository implements PaymentRequestRepository {
  async list(): Promise<PaymentRequest[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Row>(
      `SELECT * FROM payment_requests ORDER BY created_at DESC`,
    );
    return rows.map(mapRow);
  }

  async add(input: NewPaymentRequestInput): Promise<PaymentRequest> {
    const db = await getDatabase();
    const id = `PR${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const category = input.category ?? 'unknown';
    await db.runAsync(
      `INSERT INTO payment_requests
        (id, recipient_id, amount, note, transfer_name, category, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.recipientId,
        input.amount,
        input.note ?? null,
        input.transferName ?? null,
        category,
        'pending',
        createdAt,
      ],
    );
    return {
      id,
      recipientId: input.recipientId,
      amount: input.amount,
      note: input.note,
      transferName: input.transferName,
      category,
      status: 'pending',
      createdAt,
    };
  }

  async cancel(id: string): Promise<PaymentRequest> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM payment_requests WHERE id = ?`,
      [id],
    );
    if (!row) {
      throw new Error('PAYMENT_REQUEST_NOT_FOUND');
    }
    const current = mapRow(row);
    if (current.status !== 'pending') {
      throw new Error('PAYMENT_REQUEST_NOT_CANCELLABLE');
    }
    await db.runAsync(`UPDATE payment_requests SET status = ? WHERE id = ?`, [
      'cancelled',
      id,
    ]);
    return { ...current, status: 'cancelled' };
  }

  async fulfill(id: string): Promise<PaymentRequest> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Row>(
      `SELECT * FROM payment_requests WHERE id = ?`,
      [id],
    );
    if (!row) {
      throw new Error('PAYMENT_REQUEST_NOT_FOUND');
    }
    const current = mapRow(row);
    if (current.status !== 'pending') {
      throw new Error('PAYMENT_REQUEST_NOT_FULFILLABLE');
    }
    await db.runAsync(`UPDATE payment_requests SET status = ? WHERE id = ?`, [
      'paid',
      id,
    ]);
    return { ...current, status: 'paid' };
  }
}
