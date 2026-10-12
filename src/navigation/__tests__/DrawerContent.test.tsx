import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePreferencesStore } from '@/store/preferencesStore';
import { ThemeProvider } from '@/theme';

import { DrawerContent } from '../DrawerContent';

jest.mock('@react-navigation/drawer', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');
  return {
    DrawerContentScrollView: ({
      children,
      ...rest
    }: {
      children: React.ReactNode;
    }) => <ScrollView {...rest}>{children}</ScrollView>,
  };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('DrawerContent', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      locale: 'en',
      themeMode: 'system',
    });
  });

  it('sets theme and language via dropdown options', async () => {
    const navigation = {
      closeDrawer: jest.fn(),
      navigate: jest.fn(),
    };

    const { getByTestId, findByTestId } = await render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <ThemeProvider mode="light">
          <DrawerContent
            descriptors={{} as never}
            navigation={navigation as never}
            state={{} as never}
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    fireEvent.press(getByTestId('drawer-theme'));
    fireEvent.press(await findByTestId('drawer-theme-dark'));
    await waitFor(() => {
      expect(usePreferencesStore.getState().themeMode).toBe('dark');
    });

    fireEvent.press(getByTestId('drawer-language'));
    fireEvent.press(await findByTestId('drawer-language-bm'));
    await waitFor(() => {
      expect(usePreferencesStore.getState().locale).toBe('bm');
    });
  });
});
