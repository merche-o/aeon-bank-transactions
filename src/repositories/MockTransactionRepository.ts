import { mockTransactionsResponse } from '../data/mockTransactions';
import type { Transaction } from '../models/Transaction';
import type { TransactionRepository } from './TransactionRepository';
import { mapTransactionDto } from './mapTransactionDto';

export class MockTransactionRepository implements TransactionRepository {
  constructor(private readonly delayMs: number = 400) {}

  private async wait(): Promise<void> {
    if (this.delayMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.wait();
    return mockTransactionsResponse.data.map(mapTransactionDto);
  }

  async getTransactionByRefId(refId: string): Promise<Transaction | null> {
    await this.wait();
    const dto = mockTransactionsResponse.data.find((item) => item.refId === refId);
    return dto ? mapTransactionDto(dto) : null;
  }
}
