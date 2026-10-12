import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import * as ShareService from '@/services/ShareService';
import {
  resetPaymentRequestStore,
  usePaymentRequestStore,
} from '@/store/paymentRequestStore';
import {
  resetTransactionRepository,
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useTransactionDetailViewModel } from '../useTransactionDetailViewModel';

const transaction: Transaction = {
  refId: '123ABC',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'John Doe',
  transferName: 'Salary Payment',
  amount: 1500,
  category: 'salary',
    status: 'completed',
};

describe('useTransactionDetailViewModel', () => {
  const shareTransactionMock = jest.spyOn(ShareService, 'shareTransaction');

  beforeEach(() => {
    shareTransactionMock.mockResolvedValue(undefined);
    resetTransactionStore();
    resetTransactionRepository();
    resetPaymentRequestStore();
    useTransactionStore.setState({ transactions: [transaction], loading: false, error: null });
  });

  afterEach(() => {
    shareTransactionMock.mockReset();
  });

  afterAll(() => {
    shareTransactionMock.mockRestore();
  });

  it('exposes the transaction from the store', async () => {
    const { result } = await renderHook(() => useTransactionDetailViewModel('123ABC'));

    expect(result.current.transaction).toEqual(transaction);
    expect(result.current.labels.shareButton).toBeTruthy();
  });

  it('share invokes ShareService when transaction exists', async () => {
    const { result } = await renderHook(() => useTransactionDetailViewModel('123ABC'));

    await act(async () => {
      await result.current.share();
    });

    expect(shareTransactionMock).toHaveBeenCalledTimes(1);
    expect(shareTransactionMock).toHaveBeenCalledWith(
      transaction,
      expect.any(String),
      expect.objectContaining({
        reference: expect.any(String),
        amount: expect.any(String),
      }),
    );
  });

  it('share is a no-op when transaction is missing', async () => {
    useTransactionStore.setState({ transactions: [], loading: false, error: null });
    const { result } = await renderHook(() => useTransactionDetailViewModel('missing'));

    await waitFor(() => {
      expect(result.current.transaction).toBeUndefined();
    });

    await act(async () => {
      await result.current.share();
    });

    expect(shareTransactionMock).not.toHaveBeenCalled();
  });

  it('exposes settle actions for pending payment-request transactions', async () => {
    const pending: Transaction = {
      ...transaction,
      refId: 'PEND1',
      amount: 80,
      status: 'pending',
      paymentRequestId: 'pr-1',
      category: 'unknown',
    };
    useTransactionStore.setState({
      transactions: [pending],
      loading: false,
      error: null,
    });
    const fulfill = jest.fn().mockResolvedValue({
      id: 'pr-1',
      status: 'paid',
    });
    usePaymentRequestStore.setState({ fulfill });

    const { result } = await renderHook(() =>
      useTransactionDetailViewModel('PEND1'),
    );

    expect(result.current.canSettlePending).toBe(true);
    expect(result.current.statusLabel).toBeTruthy();

    await act(async () => {
      await result.current.markPaid();
    });

    expect(fulfill).toHaveBeenCalledWith('pr-1');
  });
});
