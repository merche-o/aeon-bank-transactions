import { act, render } from '@testing-library/react-native';
import { AppState, type NativeEventSubscription } from 'react-native';

import { ThemeProvider } from '@/theme';

import { PrivacyOverlay } from '../PrivacyOverlay';

describe('PrivacyOverlay', () => {
  const remove = jest.fn();

  beforeEach(() => {
    remove.mockClear();
    Object.defineProperty(AppState, 'currentState', {
      configurable: true,
      writable: true,
      value: 'active',
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      () => ({ remove }) as NativeEventSubscription,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows overlay when app starts in background', async () => {
    Object.defineProperty(AppState, 'currentState', {
      configurable: true,
      writable: true,
      value: 'background',
    });

    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <PrivacyOverlay />
      </ThemeProvider>,
    );

    expect(getByTestId('privacy-overlay')).toBeTruthy();
  });

  it('toggles overlay from AppState change listener', async () => {
    const { queryByTestId, getByTestId } = await render(
      <ThemeProvider mode="light">
        <PrivacyOverlay />
      </ThemeProvider>,
    );

    expect(queryByTestId('privacy-overlay')).toBeNull();
    expect(AppState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    const calls = (AppState.addEventListener as jest.Mock).mock.calls;
    const handler = calls[calls.length - 1][1] as (state: string) => void;

    await act(async () => {
      handler('background');
    });
    expect(getByTestId('privacy-overlay')).toBeTruthy();

    await act(async () => {
      handler('active');
    });
    expect(queryByTestId('privacy-overlay')).toBeNull();
  });
});
