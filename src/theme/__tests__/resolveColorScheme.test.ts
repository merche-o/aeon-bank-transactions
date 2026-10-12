import { resolveColorScheme } from '../ThemeContext';

describe('resolveColorScheme', () => {
  it('returns light when mode is light regardless of system', () => {
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('light', null)).toBe('light');
  });

  it('returns dark when mode is dark regardless of system', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });

  it('follows system dark preference when mode is system', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
  });

  it('defaults to light when system preference is unknown', () => {
    expect(resolveColorScheme('system', null)).toBe('light');
    expect(resolveColorScheme('system', undefined)).toBe('light');
  });
});
