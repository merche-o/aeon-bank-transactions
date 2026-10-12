import { act, renderHook } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import {
  resetTransactionStore,
  useTransactionStore,
} from '@/store/transactionStore';

import { useScheduledListViewModel } from '../useScheduledListViewModel';

const scheduled: Transaction = {
  refId: 'SCH1',
  transferDate: '2024-10-01T00:00:00Z',
  recipientName: 'Landlord',
  transferName: 'Rent',
  amount: -1200,
  category: 'bills',
  status: 'scheduled',
  scheduledFor: '2030-01-01',
};

const completed: Transaction = {
  refId: '123ABC',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'John Doe',
  transferName: 'Salary Payment',
  amount: 1500,
  category: 'salary',
  status: 'completed',
};

describe('useScheduledListViewModel', () => {
  beforeEach(() => {
    resetTransactionStore();
    useTransactionStore.setState({
      transactions: [scheduled, completed],
      cancelScheduled: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('lists only scheduled transactions with scheduledFor', async () => {
    const { result } = await renderHook(() => useScheduledListViewModel());

    expect(result.current.scheduled.map((tx) => tx.refId)).toEqual(['SCH1']);
    expect(result.current.labels.title).toBeTruthy();
  });

  it('cancel delegates to the store', async () => {
    const cancelScheduled = useTransactionStore.getState().cancelScheduled;
    const { result } = await renderHook(() => useScheduledListViewModel());

    await act(async () => {
      result.current.cancel('SCH1');
    });

    expect(cancelScheduled).toHaveBeenCalledWith('SCH1');
  });
});
