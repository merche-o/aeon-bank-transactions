import type { Transaction } from '@/models/Transaction';

export interface TransactionRepository {
  getTransactions(): Promise<Transaction[]>;
  getTransactionByRefId(refId: string): Promise<Transaction | null>;
}
