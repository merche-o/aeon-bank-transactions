import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders empty-state with title', async () => {
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <EmptyState title="No transactions" />
      </ThemeProvider>,
    );

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No transactions')).toBeTruthy();
  });
});
