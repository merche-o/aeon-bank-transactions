import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { Recipient } from '@/models/Recipient';
import type { RecipientRepository } from '@/repositories/RecipientRepository';
import {
  resetRecipientRepository,
  resetRecipientStore,
  setRecipientRepository,
  useRecipientStore,
} from '@/store/recipientStore';

import { usePaymentStartViewModel } from '../usePaymentStartViewModel';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: { mode: 'transfer' },
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

describe('usePaymentStartViewModel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    resetRecipientStore();
    resetRecipientRepository();
    useRecipientStore.setState({
      recipients,
      loading: false,
      error: null,
      fetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('filters recipients with 300ms debounce', async () => {
    const { result } = await renderHook(() => usePaymentStartViewModel());
    jest.useFakeTimers();

    expect(result.current.recipients).toHaveLength(2);

    await act(async () => {
      result.current.setQuery('Jane');
    });
    expect(result.current.recipients).toHaveLength(2);

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.recipients.map((item) => item.id)).toEqual(['R2']);
  });

  it('openRecipient navigates to QuickPay in transfer mode', async () => {
    const { result } = await renderHook(() => usePaymentStartViewModel());

    await act(async () => {
      result.current.openRecipient('R1');
    });

    expect(mockNavigate).toHaveBeenCalledWith('QuickPay', { recipientId: 'R1' });
  });

  it('openRecipient navigates to RequestPay in request mode', async () => {
    const { result } = await renderHook(() => usePaymentStartViewModel());

    await act(async () => {
      result.current.setMode('request');
    });
    await act(async () => {
      result.current.openRecipient('R2');
    });

    expect(mockNavigate).toHaveBeenCalledWith('RequestPay', {
      recipientId: 'R2',
    });
  });

  it('fetches recipients when the store is empty', async () => {
    const fetch = jest.fn().mockResolvedValue(undefined);
    const repository: RecipientRepository = {
      list: jest.fn().mockResolvedValue(recipients),
      add: jest.fn(),
      remove: jest.fn(),
    };
    setRecipientRepository(repository);
    useRecipientStore.setState({
      recipients: [],
      loading: false,
      error: null,
      fetch,
    });

    await renderHook(() => usePaymentStartViewModel());

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
