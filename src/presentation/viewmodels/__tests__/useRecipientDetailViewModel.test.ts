import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import type { Recipient } from '@/models/Recipient';
import type { Transaction } from '@/models/Transaction';
import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';
import {
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useRecipientDetailViewModel } from '../useRecipientDetailViewModel';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

const recipient: Recipient = {
  id: 'R1',
  displayName: 'John Doe',
  accountHint: '****1234',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const historyTx: Transaction = {
  refId: '123ABC',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'John Doe',
  transferName: 'Salary Payment',
  amount: 1500,
  category: 'salary',
  status: 'completed',
  recipientId: 'R1',
};

describe('useRecipientDetailViewModel', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    alertSpy.mockReset();
    resetRecipientStore();
    resetTransactionStore();
    useRecipientStore.setState({
      recipients: [recipient],
      remove: jest.fn().mockResolvedValue(undefined),
    });
    useTransactionStore.setState({
      transactions: [historyTx],
      loading: false,
      fetch: jest.fn(),
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('exposes recipient history filtered by recipient', async () => {
    const { result } = await renderHook(() =>
      useRecipientDetailViewModel('R1'),
    );

    expect(result.current.recipient?.id).toBe('R1');
    expect(result.current.history.map((tx) => tx.refId)).toEqual(['123ABC']);
  });

  it('navigates to send, request, and history detail', async () => {
    const { result } = await renderHook(() =>
      useRecipientDetailViewModel('R1'),
    );

    await act(async () => {
      result.current.openSend();
      result.current.openRequest();
      result.current.openHistoryDetail('123ABC');
    });

    expect(mockNavigate).toHaveBeenCalledWith('QuickPay', { recipientId: 'R1' });
    expect(mockNavigate).toHaveBeenCalledWith('RequestPay', {
      recipientId: 'R1',
    });
    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', {
      refId: '123ABC',
    });
  });

  it('confirmDelete shows alert and removes on confirm', async () => {
    alertSpy.mockImplementation((_title, _message, buttons) => {
      const destructive = buttons?.find((button) => button.style === 'destructive');
      destructive?.onPress?.();
    });

    const remove = useRecipientStore.getState().remove;
    const { result } = await renderHook(() =>
      useRecipientDetailViewModel('R1'),
    );

    await act(async () => {
      result.current.confirmDelete();
      await Promise.resolve();
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith('R1');
    expect(mockGoBack).toHaveBeenCalled();
  });
});
