import { create } from 'zustand';

import type { Transaction } from '@/models/Transaction';
import { MockTransactionRepository } from '@/repositories/MockTransactionRepository';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import { sortTransactions } from '@/utils/sortTransactions';

export interface TransactionStoreState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  getByRefId: (refId: string) => Transaction | undefined;
  clearError: () => void;
}

let transactionRepository: TransactionRepository = new MockTransactionRepository(0);

export function setTransactionRepository(repository: TransactionRepository): void {
  transactionRepository = repository;
}

export function resetTransactionRepository(): void {
  transactionRepository = new MockTransactionRepository(0);
}

async function loadTransactions(
  set: (
    partial:
      | Partial<TransactionStoreState>
      | ((state: TransactionStoreState) => Partial<TransactionStoreState>),
  ) => void,
): Promise<void> {
  set({ loading: true, error: null });
  try {
    const items = await transactionRepository.getTransactions();
    set({ transactions: sortTransactions(items), loading: false, error: null });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'Failed to load transactions';
    set({ loading: false, error: message });
  }
}

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetch: () => loadTransactions(set),

  refresh: () => loadTransactions(set),

  getByRefId: (refId: string) =>
    get().transactions.find((transaction) => transaction.refId === refId),

  clearError: () => set({ error: null }),
}));

export function resetTransactionStore(): void {
  useTransactionStore.setState({
    transactions: [],
    loading: false,
    error: null,
  });
}
