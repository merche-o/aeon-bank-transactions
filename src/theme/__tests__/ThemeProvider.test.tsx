import { render, renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Text } from 'react-native';

import { darkColors, lightColors } from '../colors';
import { ThemeProvider, useTheme } from '../ThemeContext';

function ThemeProbe() {
  const theme = useTheme();
  return <Text testID="scheme">{theme.colorScheme}</Text>;
}

describe('ThemeProvider', () => {
  let useColorSchemeSpy: jest.SpiedFunction<typeof ReactNative.useColorScheme>;

  beforeEach(() => {
    useColorSchemeSpy = jest
      .spyOn(ReactNative, 'useColorScheme')
      .mockReturnValue('light');
  });

  afterEach(() => {
    useColorSchemeSpy.mockRestore();
  });

  it('provides light tokens when mode is light', async () => {
    const { result } = await renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider mode="light">{children}</ThemeProvider>
      ),
    });

    expect(result.current.colorScheme).toBe('light');
    expect(result.current.colors).toEqual(lightColors);
    expect(result.current.spacing.md).toBe(12);
    expect(result.current.typography.fontSize.md).toBe(16);
  });

  it('provides dark tokens when mode is dark', async () => {
    const { result } = await renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider mode="dark">{children}</ThemeProvider>
      ),
    });

    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.colors).toEqual(darkColors);
  });

  it('uses system color scheme when mode is system', async () => {
    useColorSchemeSpy.mockReturnValue('dark');

    const { result } = await renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider mode="system">{children}</ThemeProvider>
      ),
    });

    expect(result.current.mode).toBe('system');
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.colors).toEqual(darkColors);
  });

  it('throws when useTheme is used outside ThemeProvider', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(render(<ThemeProbe />)).rejects.toThrow(
      'useTheme must be used within a ThemeProvider',
    );
    consoleSpy.mockRestore();
  });

  it('renders children', async () => {
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <Text testID="child">ok</Text>
      </ThemeProvider>,
    );
    expect(getByTestId('child')).toBeTruthy();
  });
});
