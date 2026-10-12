import { mockTransactionsResponse } from '../data/mockTransactions';
import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
} from '../models/Transaction';
import { promoteDueScheduledTransactions } from '../utils/schedule';

import type { TransactionRepository } from './TransactionRepository';
import { mapTransactionDto } from './mapTransactionDto';
import { transactionFromInput } from './transactionFromInput';

export class MockTransactionRepository implements TransactionRepository {
  private items: Transaction[];

  constructor(private readonly delayMs: number = 400) {
    this.items = mockTransactionsResponse.data.map(mapTransactionDto);
  }

  private async wait(): Promise<void> {
    if (this.delayMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  private applyPromotion(): void {
    this.items = promoteDueScheduledTransactions(this.items);
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.wait();
    this.applyPromotion();
    return [...this.items];
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | null> {
    await this.wait();
    this.applyPromotion();
    return this.items.find((item) => item.refId === refId) ?? null;
  }

  async addTransaction(input: NewTransactionInput): Promise<Transaction> {
    await this.wait();
    const created = transactionFromInput(
      `NEW${Date.now().toString(36).toUpperCase()}`,
      input,
    );
    this.items = [created, ...this.items];
    return created;
  }

  async updateTransactionCategory(
    refId: string,
    category: TransactionCategory,
  ): Promise<void> {
    await this.wait();
    this.items = this.items.map((item) =>
      item.refId === refId ? { ...item, category } : item,
    );
  }

  async cancelScheduledTransaction(refId: string): Promise<void> {
    await this.wait();
    const item = this.items.find((tx) => tx.refId === refId);
    if (!item) {
      throw new Error('TRANSACTION_NOT_FOUND');
    }
    if (item.status !== 'scheduled') {
      throw new Error('TRANSACTION_NOT_SCHEDULED');
    }
    this.items = this.items.map((tx) =>
      tx.refId === refId ? { ...tx, status: 'cancelled' } : tx,
    );
  }
}
