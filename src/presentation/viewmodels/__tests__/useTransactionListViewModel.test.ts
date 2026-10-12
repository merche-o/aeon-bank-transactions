import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import {
  resetTransactionRepository,
  resetTransactionStore,
  setTransactionRepository,
  useTransactionStore,
} from '@/store/transactionStore';

import { useTransactionListViewModel } from '../useTransactionListViewModel';

const mockNavigate = jest.fn();
const mockOpenDrawer = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    openDrawer: mockOpenDrawer,
  }),
}));

const seed: Transaction[] = [
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
    amount: -2300.75,
    category: 'bills',
    status: 'completed',
  },
  {
    refId: 'RECENT1',
    transferDate: new Date().toISOString(),
    recipientName: 'Cafe',
    transferName: 'Lunch',
    amount: -25,
    category: 'food',
    status: 'completed',
  },
];

function createMockRepository(
  overrides?: Partial<TransactionRepository>,
): TransactionRepository {
  return {
    getTransactions: jest.fn().mockResolvedValue(seed),
    getTransactionByRefId: jest.fn().mockResolvedValue(null),
    addTransaction: jest.fn(),
    updateTransactionCategory: jest.fn().mockResolvedValue(undefined),
    updateTransactionStatus: jest.fn().mockResolvedValue(undefined),
    cancelScheduledTransaction: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('useTransactionListViewModel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockOpenDrawer.mockClear();
    resetTransactionStore();
    resetTransactionRepository();
    setTransactionRepository(createMockRepository());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function renderLoaded() {
    const rendered = await renderHook(() => useTransactionListViewModel());
    await waitFor(() => {
      expect(rendered.result.current.loading).toBe(false);
    });
    return rendered;
  }

  it('loads mock transactions sorted latest first', async () => {
    const { result } = await renderLoaded();

    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.transactions[0]?.refId).toBe('RECENT1');
    expect(result.current.labels.title).toBeTruthy();
  });

  it('openDetail navigates to the detail screen', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      result.current.openDetail('456DEF');
    });

    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', {
      refId: '456DEF',
    });
  });

  it('debounces search query by 300ms before filtering', async () => {
    const { result } = await renderLoaded();
    jest.useFakeTimers();

    await act(async () => {
      result.current.setQuery('Salary');
    });

    expect(result.current.query).toBe('Salary');
    expect(result.current.transactions).toHaveLength(3);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(299);
    });
    expect(result.current.transactions).toHaveLength(3);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });

    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      '123ABC',
    ]);
  });

  it('filters by type incoming and outgoing', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      result.current.setTypeFilter('incoming');
    });
    expect(result.current.transactions.every((tx) => tx.amount >= 0)).toBe(true);
    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      '123ABC',
    ]);

    await act(async () => {
      result.current.setTypeFilter('outgoing');
    });
    expect(result.current.transactions.every((tx) => tx.amount < 0)).toBe(true);
    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      'RECENT1',
      '456DEF',
    ]);
  });

  it('filters by category', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      result.current.setCategoryFilter('food');
    });

    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      'RECENT1',
    ]);
  });

  it('filters by date range presets and custom range', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      result.current.setDateRange('7d');
    });
    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      'RECENT1',
    ]);

    await act(async () => {
      result.current.setDateRange('custom');
      result.current.setCustomStart('2024-10-01T00:00:00.000Z');
      result.current.setCustomEnd('2024-10-31T23:59:59.000Z');
    });
    expect(result.current.transactions.map((tx) => tx.refId)).toEqual([
      '123ABC',
    ]);
  });

  it('sets showNoMatchingResults when filters exclude everything', async () => {
    const { result } = await renderLoaded();
    jest.useFakeTimers();

    await act(async () => {
      result.current.setQuery('zzzz-no-match');
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.showNoMatchingResults).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('refresh reloads via store without blocking as loading', async () => {
    const repository = createMockRepository();
    setTransactionRepository(repository);
    const { result } = await renderLoaded();

    await act(async () => {
      const refreshPromise = result.current.refresh();
      expect(useTransactionStore.getState().isRefreshing).toBe(true);
      expect(result.current.loading).toBe(false);
      await refreshPromise;
    });

    expect(repository.getTransactions).toHaveBeenCalledTimes(2);
    expect(useTransactionStore.getState().isRefreshing).toBe(false);
  });

  it('retry after error reloads transactions', async () => {
    const repository = createMockRepository({
      getTransactions: jest
        .fn()
        .mockRejectedValueOnce(new Error('Network down'))
        .mockResolvedValueOnce(seed),
    });
    setTransactionRepository(repository);

    const { result } = await renderHook(() => useTransactionListViewModel());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.showFullScreenError).toBe(true);
    expect(result.current.error).toBe('Network down');

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.showFullScreenError).toBe(false);
    expect(result.current.transactions.length).toBeGreaterThan(0);
  });
});
