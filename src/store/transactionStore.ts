import { create } from 'zustand';

import type {
  NewTransactionInput,
  Transaction,
  TransactionCategory,
  TransactionStatus,
} from '@/models/Transaction';
import { MockTransactionRepository } from '@/repositories/MockTransactionRepository';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import { canAfford, sumBalance } from '@/utils/balance';
import { sortTransactions } from '@/utils/sortTransactions';

export class InsufficientFundsError extends Error {
  constructor() {
    super('INSUFFICIENT_FUNDS');
    this.name = 'InsufficientFundsError';
  }
}

export interface TransactionStoreState {
  transactions: Transaction[];
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  balance: number;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  getByRefId: (refId: string) => Transaction | undefined;
  ensureByRefId: (refId: string) => Promise<Transaction | null>;
  addTransaction: (input: NewTransactionInput) => Promise<Transaction>;
  cancelScheduled: (refId: string) => Promise<void>;
  setCategory: (refId: string, category: TransactionCategory) => Promise<void>;
  updateStatus: (refId: string, status: TransactionStatus) => Promise<void>;
  findByPaymentRequestId: (paymentRequestId: string) => Transaction | undefined;
  clearError: () => void;
}

let transactionRepository: TransactionRepository = new MockTransactionRepository(0);

export function setTransactionRepository(repository: TransactionRepository): void {
  transactionRepository = repository;
}

export function resetTransactionRepository(): void {
  transactionRepository = new MockTransactionRepository(0);
}

function withBalance(transactions: Transaction[]) {
  return {
    transactions,
    balance: sumBalance(transactions),
  };
}

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  transactions: [],
  loading: false,
  isRefreshing: false,
  error: null,
  balance: 0,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await transactionRepository.getTransactions();
      set({
        ...withBalance(sortTransactions(items)),
        loading: false,
        error: null,
      });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Failed to load transactions';
      set({ loading: false, error: message });
    }
  },

  refresh: async () => {
    set({ isRefreshing: true, error: null });
    try {
      const items = await transactionRepository.getTransactions();
      set({
        ...withBalance(sortTransactions(items)),
        isRefreshing: false,
        error: null,
      });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Failed to load transactions';
      set({ isRefreshing: false, error: message });
    }
  },

  getByRefId: (refId: string) =>
    get().transactions.find((transaction) => transaction.refId === refId),

  ensureByRefId: async (refId: string) => {
    const cached = get().getByRefId(refId);
    if (cached) {
      return cached;
    }
    const fetched = await transactionRepository.getTransactionByRefId(refId);
    if (fetched) {
      set((state) =>
        withBalance(sortTransactions([...state.transactions, fetched])),
      );
    }
    return fetched;
  },

  addTransaction: async (input: NewTransactionInput) => {
    const { balance } = get();
    if (!canAfford(balance, input.amount)) {
      throw new InsufficientFundsError();
    }
    const created = await transactionRepository.addTransaction(input);
    set((state) =>
      withBalance(sortTransactions([created, ...state.transactions])),
    );
    return created;
  },

  cancelScheduled: async (refId: string) => {
    await transactionRepository.cancelScheduledTransaction(refId);
    set((state) => ({
      ...withBalance(
        state.transactions.map((tx) =>
          tx.refId === refId ? { ...tx, status: 'cancelled' as const } : tx,
        ),
      ),
    }));
  },

  setCategory: async (refId, category) => {
    await transactionRepository.updateTransactionCategory(refId, category);
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.refId === refId ? { ...tx, category } : tx,
      ),
    }));
  },

  updateStatus: async (refId, status) => {
    await transactionRepository.updateTransactionStatus(refId, status);
    set((state) => ({
      ...withBalance(
        state.transactions.map((tx) =>
          tx.refId === refId ? { ...tx, status } : tx,
        ),
      ),
    }));
  },

  findByPaymentRequestId: (paymentRequestId) =>
    get().transactions.find((tx) => tx.paymentRequestId === paymentRequestId),

  clearError: () => set({ error: null }),
}));

export function resetTransactionStore(): void {
  useTransactionStore.setState({
    transactions: [],
    loading: false,
    isRefreshing: false,
    error: null,
    balance: 0,
  });
}
