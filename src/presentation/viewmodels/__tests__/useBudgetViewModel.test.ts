import { act, renderHook } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import {
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useBudgetViewModel } from '../useBudgetViewModel';

const mockOpenDrawer = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    openDrawer: mockOpenDrawer,
  }),
}));

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

const transactions: Transaction[] = [
  {
    refId: 'IN1',
    transferDate: isoDaysAgo(2),
    recipientName: 'Employer',
    transferName: 'Salary',
    amount: 3000,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: 'OUT1',
    transferDate: isoDaysAgo(1),
    recipientName: 'Cafe',
    transferName: 'Lunch',
    amount: -40,
    category: 'food',
    status: 'completed',
  },
  {
    refId: 'OUT2',
    transferDate: isoDaysAgo(3),
    recipientName: 'Utility Co',
    transferName: 'Electric',
    amount: -120,
    category: 'bills',
    status: 'completed',
  },
];

describe('useBudgetViewModel', () => {
  beforeEach(() => {
    mockOpenDrawer.mockClear();
    resetTransactionStore();
    useTransactionStore.setState({
      transactions,
      loading: false,
      balance: 2840,
    });
  });

  it('aggregates income and expenses for this month', async () => {
    const { result } = await renderHook(() => useBudgetViewModel());

    expect(result.current.loading).toBe(false);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.incomeFormatted).toContain('3,000.00');
    expect(result.current.expensesFormatted).toContain('160.00');
    expect(result.current.categoryRows.length).toBeGreaterThan(0);
    expect(result.current.labels.title).toBeTruthy();
  });

  it('filters by category and exposes noMatching when empty', async () => {
    const { result } = await renderHook(() => useBudgetViewModel());

    await act(async () => {
      result.current.setCategoryFilter('transportation');
    });

    expect(result.current.noMatching).toBe(true);
    expect(result.current.categoryRows).toHaveLength(0);
  });

  it('openDrawer opens the navigation drawer', async () => {
    const { result } = await renderHook(() => useBudgetViewModel());

    await act(async () => {
      result.current.openDrawer();
    });

    expect(mockOpenDrawer).toHaveBeenCalled();
  });
});
