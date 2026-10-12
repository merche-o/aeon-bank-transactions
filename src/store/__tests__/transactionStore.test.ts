import type { Transaction } from '@/models/Transaction';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import {
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
  },
  {
    refId: '123ABC',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500,
  },
  {
    refId: '456DEF',
    transferDate: '2024-09-21T09:12:45Z',
    recipientName: 'Jane Smith',
    transferName: 'Invoice Payment',
    amount: 2300.75,
  },
];

function createMockRepository(
  overrides?: Partial<TransactionRepository>,
): TransactionRepository {
  return {
    getTransactions: jest.fn().mockResolvedValue(unsorted),
    getTransactionByRefId: jest.fn().mockResolvedValue(null),
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
  });

  it('refresh reloads from repository', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);

    await useTransactionStore.getState().fetch();
    await useTransactionStore.getState().refresh();

    expect(repository.getTransactions).toHaveBeenCalledTimes(2);
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
});
