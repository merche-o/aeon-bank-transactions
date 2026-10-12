import type { ColorTokens } from './colors';
import type { Spacing } from './spacing';
import type { Typography } from './typography';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedColorScheme = 'light' | 'dark';

export type Theme = {
  colorScheme: ResolvedColorScheme;
  mode: ThemeMode;
  colors: ColorTokens;
  spacing: Spacing;
  typography: Typography;
};
