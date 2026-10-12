export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryMuted: string;
  primarySubtle: string;
  navy: string;
  navyMuted: string;
  accent: string;
  success: string;
  successMuted: string;
  error: string;
  errorMuted: string;
  overlay: string;
  focusRing: string;
};

/** Calm banking palette — teal accents on neutral / navy foundations (no purple). */
export const lightColors: ColorTokens = {
  background: '#F4F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#C5D3E0',
  borderSubtle: '#E2EAF2',
  textPrimary: '#0F2942',
  textSecondary: '#3D5A73',
  textMuted: '#6B8499',
  textInverse: '#F8FAFC',
  primary: '#0D9488',
  primaryMuted: '#0F766E',
  primarySubtle: '#CCFBF1',
  navy: '#1E3A5F',
  navyMuted: '#2D4A6F',
  accent: '#0891B2',
  success: '#15803D',
  successMuted: '#DCFCE7',
  error: '#B91C1C',
  errorMuted: '#FEE2E2',
  overlay: 'rgba(15, 41, 66, 0.45)',
  focusRing: '#14B8A6',
};

export const darkColors: ColorTokens = {
  background: '#0B1220',
  surface: '#131D2E',
  surfaceElevated: '#1A2740',
  border: '#2A3F5C',
  borderSubtle: '#1E2F45',
  textPrimary: '#E8EEF4',
  textSecondary: '#A8BDCF',
  textMuted: '#7A94AB',
  textInverse: '#0F2942',
  primary: '#2DD4BF',
  primaryMuted: '#14B8A6',
  primarySubtle: '#134E4A',
  navy: '#1E3A5F',
  navyMuted: '#2A4D73',
  accent: '#22D3EE',
  success: '#4ADE80',
  successMuted: '#14532D',
  error: '#F87171',
  errorMuted: '#450A0A',
  overlay: 'rgba(0, 0, 0, 0.55)',
  focusRing: '#5EEAD4',
};
