import {
  migratePreferences,
  usePreferencesStore,
} from '@/store/preferencesStore';

describe('migratePreferences', () => {
  it('applies defaults when persisted is undefined', () => {
    expect(migratePreferences(undefined)).toEqual({
      locale: 'en',
      themeMode: 'system',
      firstName: '',
      lastName: '',
      dateOfBirth: null,
    });
  });

  it('splits legacy displayName into first/last when names missing', () => {
    expect(
      migratePreferences({
        locale: 'bm',
        themeMode: 'dark',
        displayName: 'Ainur Rahman',
      }),
    ).toEqual({
      locale: 'bm',
      themeMode: 'dark',
      firstName: 'Ainur',
      lastName: 'Rahman',
      dateOfBirth: null,
    });
  });

  it('prefers explicit firstName/lastName over displayName', () => {
    expect(
      migratePreferences({
        firstName: 'Ada',
        lastName: 'Lovelace',
        displayName: 'Ignored Name',
        dateOfBirth: '1990-05-01',
      }),
    ).toEqual({
      locale: 'en',
      themeMode: 'system',
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1990-05-01',
    });
  });
});

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      locale: 'en',
      themeMode: 'system',
      firstName: '',
      lastName: '',
      dateOfBirth: null,
    });
  });

  it('setLocale updates locale', () => {
    usePreferencesStore.getState().setLocale('bm');
    expect(usePreferencesStore.getState().locale).toBe('bm');
  });

  it('setThemeMode updates theme', () => {
    usePreferencesStore.getState().setThemeMode('dark');
    expect(usePreferencesStore.getState().themeMode).toBe('dark');
  });

  it('setProfile updates name and date of birth', () => {
    usePreferencesStore.getState().setProfile({
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1990-05-01',
    });

    const state = usePreferencesStore.getState();
    expect(state.firstName).toBe('Ada');
    expect(state.lastName).toBe('Lovelace');
    expect(state.dateOfBirth).toBe('1990-05-01');
  });
});
