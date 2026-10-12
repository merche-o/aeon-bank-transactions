import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Locale } from '@/i18n/types';
import { splitDisplayName } from '@/utils/profile';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PreferencesState {
  locale: Locale;
  themeMode: ThemeMode;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  setLocale: (locale: Locale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setDateOfBirth: (dateOfBirth: string | null) => void;
  setProfile: (profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
  }) => void;
}

type PersistedPreferences = {
  locale?: Locale;
  themeMode?: ThemeMode;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  /** Legacy fields — migrated once on rehydrate */
  displayName?: string;
  age?: number | null;
};

const STORAGE_KEY = '@aeon/preferences';

export function migratePreferences(
  persisted: PersistedPreferences | undefined,
): Pick<
  PreferencesState,
  'locale' | 'themeMode' | 'firstName' | 'lastName' | 'dateOfBirth'
> {
  const locale = persisted?.locale ?? 'en';
  const themeMode = persisted?.themeMode ?? 'system';

  let firstName = persisted?.firstName ?? '';
  let lastName = persisted?.lastName ?? '';
  const dateOfBirth = persisted?.dateOfBirth ?? null;

  if (!firstName && persisted?.displayName) {
    const split = splitDisplayName(persisted.displayName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  return { locale, themeMode, firstName, lastName, dateOfBirth };
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      themeMode: 'system',
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      setLocale: (locale) => set({ locale }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setProfile: (profile) => set(profile),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locale: state.locale,
        themeMode: state.themeMode,
        firstName: state.firstName,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth,
      }),
      merge: (persisted, current) => {
        const migrated = migratePreferences(
          persisted as PersistedPreferences | undefined,
        );
        return {
          ...current,
          ...migrated,
        };
      },
    },
  ),
);
