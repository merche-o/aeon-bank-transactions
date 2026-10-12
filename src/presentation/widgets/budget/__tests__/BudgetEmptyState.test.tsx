import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { BudgetEmptyState } from '../BudgetEmptyState';

describe('BudgetEmptyState', () => {
  it('renders the empty message', async () => {
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <BudgetEmptyState message="No transactions in this period" />
      </ThemeProvider>,
    );

    expect(getByTestId('budget-empty-state')).toBeTruthy();
    expect(getByText('No transactions in this period')).toBeTruthy();
  });
});
