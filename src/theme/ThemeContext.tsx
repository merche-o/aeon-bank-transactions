import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import type { ResolvedColorScheme, Theme, ThemeMode } from './types';

function resolveColorScheme(
  mode: ThemeMode,
  systemScheme: ResolvedColorScheme | null | undefined,
): ResolvedColorScheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

const ThemeContext = createContext<Theme | null>(null);

export type ThemeProviderProps = PropsWithChildren<{
  mode?: ThemeMode;
}>;

export function ThemeProvider({
  mode = 'system',
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolvedSystemScheme: ResolvedColorScheme | null =
    systemScheme === 'dark' || systemScheme === 'light' ? systemScheme : null;

  const theme = useMemo((): Theme => {
    const colorScheme = resolveColorScheme(mode, resolvedSystemScheme);
    return {
      mode,
      colorScheme,
      colors: colorScheme === 'dark' ? darkColors : lightColors,
      spacing,
      typography,
    };
  }, [mode, resolvedSystemScheme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (theme == null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}

export { resolveColorScheme };
