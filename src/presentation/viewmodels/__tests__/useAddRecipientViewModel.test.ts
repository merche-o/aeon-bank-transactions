import { act, renderHook } from '@testing-library/react-native';

import {
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';

import { useAddRecipientViewModel } from '../useAddRecipientViewModel';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: jest.fn(),
  }),
}));

describe('useAddRecipientViewModel', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    resetRecipientStore();
    useRecipientStore.setState({
      add: jest.fn().mockResolvedValue({
        id: 'R99',
        displayName: 'New Friend',
        createdAt: '2024-02-01T00:00:00.000Z',
      }),
    });
  });

  it('blocks save until display name is set', async () => {
    const { result } = await renderHook(() => useAddRecipientViewModel());

    expect(result.current.canSave).toBe(false);
    await act(async () => {
      result.current.setDisplayName('  New Friend  ');
      result.current.setAccountHint('****0001');
    });
    expect(result.current.canSave).toBe(true);
  });

  it('save adds recipient and goes back', async () => {
    const add = useRecipientStore.getState().add;
    const { result } = await renderHook(() => useAddRecipientViewModel());

    await act(async () => {
      result.current.setDisplayName('New Friend');
      result.current.setAccountHint('****0001');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(add).toHaveBeenCalledWith({
      displayName: 'New Friend',
      accountHint: '****0001',
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});
