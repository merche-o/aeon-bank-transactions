import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders error-state and retry-button, invoking onRetry', async () => {
    const onRetry = jest.fn();
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <ErrorState onRetry={onRetry} retryLabel="Retry" title="Load failed" />
      </ThemeProvider>,
    );

    expect(getByTestId('error-state')).toBeTruthy();
    expect(getByText('Load failed')).toBeTruthy();

    fireEvent.press(getByTestId('retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
