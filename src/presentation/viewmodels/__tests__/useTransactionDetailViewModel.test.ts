import { act, renderHook } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import * as ShareService from '@/services/ShareService';
import {
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
};

describe('useTransactionDetailViewModel', () => {
  const shareTransactionMock = jest.spyOn(ShareService, 'shareTransaction');

  beforeEach(() => {
    shareTransactionMock.mockResolvedValue(undefined);
    resetTransactionStore();
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
    const { result } = await renderHook(() => useTransactionDetailViewModel('missing'));

    await act(async () => {
      await result.current.share();
    });

    expect(shareTransactionMock).not.toHaveBeenCalled();
  });
});
