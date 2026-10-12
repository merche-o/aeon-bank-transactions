import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders loading-state with message', async () => {
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <LoadingState message="Loading transactions…" />
      </ThemeProvider>,
    );

    expect(getByTestId('loading-state')).toBeTruthy();
    expect(getByText('Loading transactions…')).toBeTruthy();
  });
});
