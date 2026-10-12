import { avatarInitialFromName, splitDisplayName } from '../profile';
import { migratePreferences } from '@/store/preferencesStore';

describe('profile helpers', () => {
  it('splits display name into first and last', () => {
    expect(splitDisplayName('Ainur Mercher')).toEqual({
      firstName: 'Ainur',
      lastName: 'Mercher',
    });
    expect(splitDisplayName('Ainur')).toEqual({
      firstName: 'Ainur',
      lastName: '',
    });
    expect(splitDisplayName('  ')).toEqual({ firstName: '', lastName: '' });
  });

  it('derives avatar initial', () => {
    expect(avatarInitialFromName('ainur')).toBe('A');
    expect(avatarInitialFromName('', 'C')).toBe('C');
  });
});

describe('migratePreferences', () => {
  it('migrates legacy displayName into first/last name', () => {
    expect(
      migratePreferences({
        locale: 'en',
        themeMode: 'light',
        displayName: 'Jane Doe',
        age: 30,
      }),
    ).toEqual({
      locale: 'en',
      themeMode: 'light',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: null,
    });
  });

  it('keeps firstName when already present', () => {
    expect(
      migratePreferences({
        firstName: 'Sam',
        lastName: 'Lee',
        displayName: 'Ignored Name',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
      }),
    ).toMatchObject({
      firstName: 'Sam',
      lastName: 'Lee',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
    });
  });
});
