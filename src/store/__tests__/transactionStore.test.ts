import type { Transaction } from '@/models/Transaction';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import {
  InsufficientFundsError,
  resetTransactionRepository,
  resetTransactionStore,
  setTransactionRepository,
  useTransactionStore,
} from '@/store/transactionStore';

const unsorted: Transaction[] = [
  {
    refId: '101JKL',
    transferDate: '2024-08-30T11:47:22Z',
    recipientName: 'Emily Davis',
    transferName: 'Bonus Payment',
    amount: 1200,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: '123ABC',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: '456DEF',
    transferDate: '2024-09-21T09:12:45Z',
    recipientName: 'Jane Smith',
    transferName: 'Invoice Payment',
    amount: 2300.75,
    category: 'bills',
    status: 'completed',
  },
];

function createMockRepository(
  overrides?: Partial<TransactionRepository>,
): TransactionRepository {
  return {
    getTransactions: jest.fn().mockResolvedValue(unsorted),
    getTransactionByRefId: jest.fn().mockResolvedValue(null),
    addTransaction: jest.fn(),
    updateTransactionCategory: jest.fn().mockResolvedValue(undefined),
    updateTransactionStatus: jest.fn().mockResolvedValue(undefined),
    cancelScheduledTransaction: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('transactionStore', () => {
  beforeEach(() => {
    resetTransactionStore();
    resetTransactionRepository();
  });

  it('fetch loads transactions sorted latest first', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();

    const { transactions, loading, error } = useTransactionStore.getState();
    expect(repository.getTransactions).toHaveBeenCalledTimes(1);
    expect(loading).toBe(false);
    expect(error).toBeNull();
    expect(transactions.map((t) => t.refId)).toEqual([
      '123ABC',
      '456DEF',
      '101JKL',
    ]);
    expect(useTransactionStore.getState().balance).toBeCloseTo(5000.75);
  });

  it('refresh reloads from repository using isRefreshing not loading', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();
    expect(useTransactionStore.getState().loading).toBe(false);

    const refreshPromise = useTransactionStore.getState().refresh();
    expect(useTransactionStore.getState().isRefreshing).toBe(true);
    expect(useTransactionStore.getState().loading).toBe(false);

    await refreshPromise;

    expect(repository.getTransactions).toHaveBeenCalledTimes(2);
    expect(useTransactionStore.getState().isRefreshing).toBe(false);
    expect(useTransactionStore.getState().loading).toBe(false);
  });

  it('getByRefId returns a cached transaction', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();
    const found = useTransactionStore.getState().getByRefId('456DEF');

    expect(found?.transferName).toBe('Invoice Payment');
  });

  it('sets error when repository fails and clearError clears it', async () => {
    const repository = createMockRepository({
      getTransactions: jest.fn().mockRejectedValue(new Error('Network down')),
    });
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();

    expect(useTransactionStore.getState().error).toBe('Network down');
    useTransactionStore.getState().clearError();
    expect(useTransactionStore.getState().error).toBeNull();
  });

  it('addTransaction rejects when balance is insufficient', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();
    const countBefore = useTransactionStore.getState().transactions.length;

    await expect(
      useTransactionStore.getState().addTransaction({
        transferDate: '2024-10-20T00:00:00Z',
        recipientName: 'Big Co',
        transferName: 'Huge bill',
        amount: -999_999,
        category: 'bills',
    status: 'completed',
      }),
    ).rejects.toBeInstanceOf(InsufficientFundsError);

    expect(repository.addTransaction).not.toHaveBeenCalled();
    expect(useTransactionStore.getState().transactions).toHaveLength(countBefore);
  });

  it('addTransaction appends and updates balance when affordable', async () => {
    const created: Transaction = {
      refId: 'NEW1',
      transferDate: '2024-10-20T00:00:00Z',
      recipientName: 'Cafe',
      transferName: 'Coffee',
      amount: -10,
      category: 'food',
    status: 'completed',
    };
    const repository = createMockRepository({
      addTransaction: jest.fn().mockResolvedValue(created),
    });
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();
    const balanceBefore = useTransactionStore.getState().balance;

    const result = await useTransactionStore.getState().addTransaction({
      transferDate: created.transferDate,
      recipientName: created.recipientName,
      transferName: created.transferName,
      amount: created.amount,
      category: created.category,
    });

    expect(result).toEqual(created);
    expect(useTransactionStore.getState().transactions[0]?.refId).toBe('NEW1');
    expect(useTransactionStore.getState().balance).toBeCloseTo(balanceBefore - 10);
  });
});
