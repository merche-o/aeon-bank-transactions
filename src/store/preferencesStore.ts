import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Locale } from '@/i18n/types';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PreferencesState {
  locale: Locale;
  themeMode: ThemeMode;
  displayName: string;
  age: number | null;
  setLocale: (locale: Locale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setDisplayName: (displayName: string) => void;
  setAge: (age: number | null) => void;
}

const STORAGE_KEY = '@aeon/preferences';

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      themeMode: 'system',
      displayName: '',
      age: null,
      setLocale: (locale) => set({ locale }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setDisplayName: (displayName) => set({ displayName }),
      setAge: (age) => set({ age }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locale: state.locale,
        themeMode: state.themeMode,
        displayName: state.displayName,
        age: state.age,
      }),
    },
  ),
);
