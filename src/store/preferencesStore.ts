import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Locale } from '@/i18n/types';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PreferencesState {
  locale: Locale;
  themeMode: ThemeMode;
  setLocale: (locale: Locale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
}

const STORAGE_KEY = '@aeon/preferences';

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      themeMode: 'system',
      setLocale: (locale) => set({ locale }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locale: state.locale,
        themeMode: state.themeMode,
      }),
    },
  ),
);
