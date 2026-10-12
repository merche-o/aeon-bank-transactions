import { act, renderHook } from '@testing-library/react-native';

import { usePreferencesStore } from '@/store/preferencesStore';

import { useProfileSettingsViewModel } from '../useProfileSettingsViewModel';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('useProfileSettingsViewModel', () => {
  beforeEach(() => {
    mockGoBack.mockClear();
    usePreferencesStore.setState({
      locale: 'en',
      themeMode: 'system',
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1990-05-01',
      setProfile: jest.fn(),
    });
  });

  it('hydrates draft fields from preferences', async () => {
    const { result } = await renderHook(() => useProfileSettingsViewModel());

    expect(result.current.firstName).toBe('Ada');
    expect(result.current.lastName).toBe('Lovelace');
    expect(result.current.dobParts.year).toBe('1990');
    expect(result.current.labels.title).toBeTruthy();
  });

  it('save persists profile and goes back for a valid adult DOB', async () => {
    const setProfile = usePreferencesStore.getState().setProfile;
    const { result } = await renderHook(() => useProfileSettingsViewModel());

    await act(async () => {
      result.current.setFirstName('Ada');
      result.current.setLastName('Byron');
      result.current.onDobPartsChange({ day: '1', month: '5', year: '1990' });
    });

    await act(async () => {
      result.current.save();
    });

    expect(setProfile).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Byron',
      dateOfBirth: '1990-05-01T00:00:00.000Z',
    });
    expect(mockGoBack).toHaveBeenCalled();
    expect(result.current.dobError).toBeNull();
  });

  it('sets dobError for incomplete date of birth', async () => {
    const setProfile = usePreferencesStore.getState().setProfile;
    const { result } = await renderHook(() => useProfileSettingsViewModel());

    await act(async () => {
      result.current.onDobPartsChange({ day: '1', month: '', year: '1990' });
    });
    await act(async () => {
      result.current.save();
    });

    expect(result.current.dobError).toBeTruthy();
    expect(setProfile).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
