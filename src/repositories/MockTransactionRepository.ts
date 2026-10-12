import { mockTransactionsResponse } from '../data/mockTransactions';
import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
} from '../models/Transaction';
import type { TransactionRepository } from './TransactionRepository';
import { mapTransactionDto } from './mapTransactionDto';

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

  async getTransactions(): Promise<Transaction[]> {
    await this.wait();
    return [...this.items];
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | null> {
    await this.wait();
    return this.items.find((item) => item.refId === refId) ?? null;
  }

  async addTransaction(input: NewTransactionInput): Promise<Transaction> {
    await this.wait();
    const created: Transaction = {
      refId: `NEW${Date.now().toString(36).toUpperCase()}`,
      ...input,
    };
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
}
