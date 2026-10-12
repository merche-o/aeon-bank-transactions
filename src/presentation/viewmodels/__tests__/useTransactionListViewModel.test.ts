import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  resetTransactionRepository,
  resetTransactionStore,
} from '@/store/transactionStore';

import { useTransactionListViewModel } from '../useTransactionListViewModel';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('useTransactionListViewModel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    resetTransactionStore();
    resetTransactionRepository();
  });

  it('loads mock transactions sorted latest first', async () => {
    const { result } = await renderHook(() => useTransactionListViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.transactions[0]?.refId).toBe('123ABC');
    expect(result.current.labels.title).toBeTruthy();
  });

  it('openDetail navigates to the detail screen', async () => {
    const { result } = await renderHook(() => useTransactionListViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.openDetail('456DEF');
    });

    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', { refId: '456DEF' });
  });
});
