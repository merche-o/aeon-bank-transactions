import { act, renderHook } from '@testing-library/react-native';

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
import {
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useRequestPayViewModel } from '../useRequestPayViewModel';

const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

const recipient: Recipient = {
  id: 'R1',
  displayName: 'John Doe',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('useRequestPayViewModel', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    resetRecipientStore();
    resetPaymentRequestStore();
    resetTransactionStore();
    useRecipientStore.setState({ recipients: [recipient] });
    useTransactionStore.setState({
      findByPaymentRequestId: jest.fn().mockReturnValue({
        refId: 'PEND1',
      }),
    });
    usePaymentRequestStore.setState({
      add: jest.fn().mockResolvedValue({
        id: 'pr-1',
        recipientId: 'R1',
        amount: 40,
        status: 'pending',
        createdAt: '2024-10-01T00:00:00Z',
        category: 'food',
      } satisfies PaymentRequest),
    });
  });

  it('requires a positive amount before create', async () => {
    const { result } = await renderHook(() => useRequestPayViewModel('R1'));

    expect(result.current.canCreate).toBe(false);
    await act(async () => {
      result.current.setAmountText('40');
    });
    expect(result.current.canCreate).toBe(true);
  });

  it('createRequest adds via store and navigates to confirm', async () => {
    const add = usePaymentRequestStore.getState().add;
    const { result } = await renderHook(() => useRequestPayViewModel('R1'));

    await act(async () => {
      result.current.setAmountText('40');
      result.current.setNote('Lunch');
      result.current.setTransferNameDraft('Pay request');
      result.current.setCategory('food');
    });

    await act(async () => {
      await result.current.createRequest();
    });

    expect(add).toHaveBeenCalledWith({
      recipientId: 'R1',
      amount: 40,
      note: 'Lunch',
      transferName: 'Pay request',
      category: 'food',
    });
    expect(mockReplace).toHaveBeenCalledWith('PaymentConfirm', {
      kind: 'request',
      paymentRequestId: 'pr-1',
      refId: 'PEND1',
    });
  });
});
