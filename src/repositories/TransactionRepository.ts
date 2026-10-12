import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
} from '../models/Transaction';

export interface TransactionRepository {
  getTransactions(): Promise<Transaction[]>;
  getTransactionByRefId(refId: string): Promise<Transaction | null>;
  addTransaction(input: NewTransactionInput): Promise<Transaction>;
  updateTransactionCategory(
    refId: string,
    category: TransactionCategory,
  ): Promise<void>;
  cancelScheduledTransaction(refId: string): Promise<void>;
}
