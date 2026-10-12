import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { PaymentRequest } from '@/models/PaymentRequest';
import type { Recipient } from '@/models/Recipient';
import {
  resetPaymentRequestStore,
  usePaymentRequestStore,
} from '@/store/paymentRequestStore';
import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';

import { usePaymentRequestsListViewModel } from '../usePaymentRequestsListViewModel';

const recipient: Recipient = {
  id: 'R1',
  displayName: 'Alex Payee',
  createdAt: '2024-01-01T00:00:00Z',
};

const pending: PaymentRequest = {
  id: 'pr-1',
  recipientId: 'R1',
  amount: 80,
  note: 'Dinner',
  status: 'pending',
  createdAt: '2024-10-01T00:00:00Z',
  category: 'food',
};

const paid: PaymentRequest = {
  id: 'pr-2',
  recipientId: 'R1',
  amount: 20,
  status: 'paid',
  createdAt: '2024-09-01T00:00:00Z',
  category: 'food',
};

describe('usePaymentRequestsListViewModel', () => {
  beforeEach(() => {
    resetPaymentRequestStore();
    resetRecipientStore();
    useRecipientStore.setState({ recipients: [recipient] });
    usePaymentRequestStore.setState({
      paymentRequests: [pending, paid],
      fetch: jest.fn().mockResolvedValue(undefined),
      fulfill: jest.fn().mockResolvedValue({ ...pending, status: 'paid' }),
      cancel: jest.fn().mockResolvedValue({ ...pending, status: 'cancelled' }),
    });
  });

  it('fetches on mount and maps pending rows with recipient names', async () => {
    const fetch = usePaymentRequestStore.getState().fetch;
    const { result } = await renderHook(() =>
      usePaymentRequestsListViewModel(),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(result.current.pendingRows).toEqual([
      {
        id: 'pr-1',
        recipientName: 'Alex Payee',
        amount: 80,
        note: 'Dinner',
      },
    ]);
  });

  it('markPaid and cancelRequest call store actions', async () => {
    const fulfill = usePaymentRequestStore.getState().fulfill;
    const cancel = usePaymentRequestStore.getState().cancel;
    const { result } = await renderHook(() =>
      usePaymentRequestsListViewModel(),
    );

    await act(async () => {
      result.current.markPaid('pr-1');
      result.current.cancelRequest('pr-1');
    });

    expect(fulfill).toHaveBeenCalledWith('pr-1');
    expect(cancel).toHaveBeenCalledWith('pr-1');
  });
});
