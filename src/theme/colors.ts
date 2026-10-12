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

/** AEON Bank palette — magenta accents on soft pink-gray / charcoal neutrals. */
export const lightColors: ColorTokens = {
  background: '#FAF6F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5D6DF',
  borderSubtle: '#F2EBF0',
  textPrimary: '#1F1520',
  textSecondary: '#4A3D48',
  textMuted: '#7A6B75',
  textInverse: '#FFFFFF',
  primary: '#B0307A',
  primaryMuted: '#922D62',
  primarySubtle: '#F9E4F0',
  navy: '#2D1F28',
  navyMuted: '#45333F',
  accent: '#C9488E',
  success: '#15803D',
  successMuted: '#DCFCE7',
  error: '#B91C1C',
  errorMuted: '#FEE2E2',
  overlay: 'rgba(31, 21, 32, 0.45)',
  focusRing: '#B0307A',
};

export const darkColors: ColorTokens = {
  background: '#121018',
  surface: '#1C1822',
  surfaceElevated: '#26212C',
  border: '#3D3542',
  borderSubtle: '#2A2430',
  textPrimary: '#F5F0F3',
  textSecondary: '#C4B5BE',
  textMuted: '#8F7F89',
  textInverse: '#FFFFFF',
  primary: '#D857A0',
  primaryMuted: '#B0307A',
  primarySubtle: '#3D2235',
  navy: '#F5EBF2',
  navyMuted: '#D4C0CC',
  accent: '#E878B8',
  success: '#4ADE80',
  successMuted: '#14532D',
  error: '#F87171',
  errorMuted: '#450A0A',
  overlay: 'rgba(0, 0, 0, 0.55)',
  focusRing: '#D857A0',
};
