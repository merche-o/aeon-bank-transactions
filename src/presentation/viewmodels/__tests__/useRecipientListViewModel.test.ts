import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Recipient } from '@/models/Recipient';
import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';

import { useRecipientListViewModel } from '../useRecipientListViewModel';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const recipients: Recipient[] = [
  {
    id: 'R1',
    displayName: 'John Doe',
    accountHint: '****1234',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'R2',
    displayName: 'Jane Smith',
    accountHint: '****5678',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

describe('useRecipientListViewModel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    resetRecipientStore();
    useRecipientStore.setState({
      recipients,
      loading: false,
      error: null,
      fetch: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches on mount and filters with debounce', async () => {
    const fetch = useRecipientStore.getState().fetch;
    const { result } = await renderHook(() => useRecipientListViewModel());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    jest.useFakeTimers();
    await act(async () => {
      result.current.setQuery('john');
    });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.recipients.map((item) => item.id)).toEqual(['R1']);
  });

  it('navigates to add, scheduled, requests, and detail', async () => {
    const { result } = await renderHook(() => useRecipientListViewModel());

    await act(async () => {
      result.current.openAdd();
      result.current.openScheduled();
      result.current.openRequests();
      result.current.openRecipient('R2');
    });

    expect(mockNavigate).toHaveBeenCalledWith('AddRecipient');
    expect(mockNavigate).toHaveBeenCalledWith('ScheduledList');
    expect(mockNavigate).toHaveBeenCalledWith('PaymentRequestsList');
    expect(mockNavigate).toHaveBeenCalledWith('RecipientDetail', {
      recipientId: 'R2',
    });
  });
});
