import { act, renderHook } from '@testing-library/react-native';

import type { Recipient } from '@/models/Recipient';
import type { Transaction } from '@/models/Transaction';
import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';
import {
  resetTransactionRepository,
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useQuickPayViewModel } from '../useQuickPayViewModel';

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
  accountHint: '****1234',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('useQuickPayViewModel', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    resetRecipientStore();
    resetTransactionStore();
    resetTransactionRepository();
    useRecipientStore.setState({ recipients: [recipient] });
    useTransactionStore.setState({
      balance: 1000,
      transactions: [],
      loading: false,
      error: null,
      addTransaction: jest.fn().mockImplementation(async (input) => {
        const created: Transaction = {
          refId: 'NEW1',
          transferDate: input.transferDate,
          recipientName: input.recipientName,
          transferName: input.transferName,
          amount: input.amount,
          category: input.category,
          status: input.status ?? 'completed',
          scheduledFor: input.scheduledFor,
          recipientId: input.recipientId,
        };
        return created;
      }),
    });
  });

  it('exposes recipient and blocks confirm until amount is valid', async () => {
    const { result } = await renderHook(() => useQuickPayViewModel('R1'));

    expect(result.current.recipient?.id).toBe('R1');
    expect(result.current.canConfirm).toBe(false);

    await act(async () => {
      result.current.setAmountText('25.50');
    });
    expect(result.current.canConfirm).toBe(true);
    expect(result.current.showInsufficientFunds).toBe(false);
  });

  it('shows insufficient funds when amount exceeds balance', async () => {
    const { result } = await renderHook(() => useQuickPayViewModel('R1'));

    await act(async () => {
      result.current.setAmountText('5000');
    });

    expect(result.current.showInsufficientFunds).toBe(true);
    expect(result.current.canConfirm).toBe(false);
  });

  it('confirm sends now and navigates to PaymentConfirm', async () => {
    const addTransaction = useTransactionStore.getState().addTransaction;
    const { result } = await renderHook(() => useQuickPayViewModel('R1'));

    await act(async () => {
      result.current.setAmountText('10');
      result.current.setTransferNameDraft('Coffee');
      result.current.setCategory('food');
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -10,
        recipientName: 'John Doe',
        transferName: 'Coffee',
        category: 'food',
        recipientId: 'R1',
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith('PaymentConfirm', {
      kind: 'transfer',
      refId: 'NEW1',
    });
  });

  it('confirm schedules a future transfer', async () => {
    const addTransaction = useTransactionStore.getState().addTransaction;
    const { result } = await renderHook(() => useQuickPayViewModel('R1'));

    await act(async () => {
      result.current.setAmountText('15');
      result.current.setTiming('schedule');
      result.current.setScheduleDateIso('2030-01-15T00:00:00.000Z');
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'scheduled',
        scheduledFor: '2030-01-15',
        amount: -15,
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith('PaymentConfirm', {
      kind: 'schedule',
      refId: 'NEW1',
    });
  });
});
