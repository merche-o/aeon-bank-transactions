import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

import type { Transaction } from '@/models/Transaction';
import * as ShareService from '@/services/ShareService';
import {
  resetPaymentRequestStore,
  usePaymentRequestStore,
} from '@/store/paymentRequestStore';
import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';
import {
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { usePaymentConfirmViewModel } from '../usePaymentConfirmViewModel';

const mockPopToTop = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popToTop: mockPopToTop,
    replace: mockReplace,
  }),
  useRoute: () => ({
    params: {
      kind: 'transfer',
      refId: '123ABC',
    },
  }),
}));

const transaction: Transaction = {
  refId: '123ABC',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'John Doe',
  transferName: 'Salary Payment',
  amount: 1500,
  category: 'salary',
  status: 'completed',
  recipientId: 'R1',
};

describe('usePaymentConfirmViewModel', () => {
  const shareMock = jest.spyOn(ShareService, 'shareTransaction');
  let parallelSpy: jest.SpyInstance;

  beforeEach(() => {
    mockPopToTop.mockClear();
    mockReplace.mockClear();
    shareMock.mockResolvedValue(undefined);
    resetTransactionStore();
    resetRecipientStore();
    resetPaymentRequestStore();
    useTransactionStore.setState({ transactions: [transaction] });
    useRecipientStore.setState({
      recipients: [
        {
          id: 'R1',
          displayName: 'John Doe',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    });
    usePaymentRequestStore.setState({ paymentRequests: [] });

    parallelSpy = jest.spyOn(Animated, 'parallel').mockReturnValue({
      start: (callback?: (result: { finished: boolean }) => void) => {
        callback?.({ finished: true });
        return { stop: jest.fn() };
      },
      stop: jest.fn(),
      reset: jest.fn(),
    } as unknown as Animated.CompositeAnimation);
  });

  afterEach(() => {
    shareMock.mockReset();
    parallelSpy.mockRestore();
  });

  afterAll(() => {
    shareMock.mockRestore();
  });

  it('exposes transfer confirmation details after animation', async () => {
    const { result } = await renderHook(() => usePaymentConfirmViewModel());

    await waitFor(() => {
      expect(result.current.showDetails).toBe(true);
    });

    expect(result.current.recipientName).toBe('John Doe');
    expect(result.current.amountFormatted).toContain('1,500.00');
    expect(result.current.canShare).toBe(true);
    expect(result.current.labels.success).toBeTruthy();
  });

  it('done pops to top and share invokes ShareService', async () => {
    const { result } = await renderHook(() => usePaymentConfirmViewModel());

    await waitFor(() => {
      expect(result.current.showDetails).toBe(true);
    });

    await act(async () => {
      result.current.done();
    });
    expect(mockPopToTop).toHaveBeenCalled();

    await act(async () => {
      await result.current.share();
    });
    expect(shareMock).toHaveBeenCalledWith(
      transaction,
      expect.any(String),
      expect.objectContaining({
        reference: expect.any(String),
      }),
    );
  });

  it('openDetail replaces with TransactionDetail', async () => {
    const { result } = await renderHook(() => usePaymentConfirmViewModel());

    await act(async () => {
      result.current.openDetail();
    });

    expect(mockReplace).toHaveBeenCalledWith('TransactionDetail', {
      refId: '123ABC',
    });
  });
});
