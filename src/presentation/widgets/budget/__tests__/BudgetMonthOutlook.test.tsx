import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { BudgetMonthOutlook } from '../BudgetMonthOutlook';

describe('BudgetMonthOutlook', () => {
  it('renders upcoming count in a badge', async () => {
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <BudgetMonthOutlook
          dailyAverageFormatted="RM 10.00"
          labels={{
            title: 'Outlook',
            dailyAverage: 'Daily average',
            projected: 'Projected',
            upcoming: 'Upcoming',
          }}
          projectedFormatted="RM 310.00"
          upcomingCount={1}
          upcomingFormatted="RM 50.00"
          visible
        />
      </ThemeProvider>,
    );

    expect(getByText('Upcoming')).toBeTruthy();
    expect(getByTestId('budget-upcoming-count')).toHaveTextContent('1');
    expect(getByText('RM 50.00')).toBeTruthy();
  });
});
