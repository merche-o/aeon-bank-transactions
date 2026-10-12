import { render, within } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { BudgetCashFlowHero } from '../BudgetCashFlowHero';

describe('BudgetCashFlowHero', () => {
  it('shows income, expenses, and net with formatted values', async () => {
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <BudgetCashFlowHero
          expensesFormatted="RM 420.50"
          incomeFormatted="RM 1,200.00"
          labels={{
            thisPeriod: 'This period',
            income: 'Income',
            expenses: 'Expenses',
            net: 'Net',
          }}
          netFormatted="RM 779.50"
          netPositive
        />
      </ThemeProvider>,
    );

    expect(within(getByTestId('budget-income')).getByText('RM 1,200.00')).toBeTruthy();
    expect(within(getByTestId('budget-expenses')).getByText('RM 420.50')).toBeTruthy();
    expect(getByTestId('budget-net')).toHaveTextContent('RM 779.50');
  });
});
