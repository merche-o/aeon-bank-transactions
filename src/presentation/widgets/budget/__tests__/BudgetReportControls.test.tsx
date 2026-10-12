import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import {
  BudgetReportControls,
  type BudgetReportControlsProps,
} from '../BudgetReportControls';

const defaultLabels: BudgetReportControlsProps['labels'] = {
  category: 'Category',
  categoryAll: 'All',
  dateTitle: 'Date range',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  last3Months: 'Last 3 months',
  last6Months: 'Last 6 months',
  custom: 'Custom',
  apply: 'Apply',
  dateSummaryThisMonth: 'This month',
  dateSummaryLastMonth: 'Last month',
  dateSummaryLast3Months: 'Last 3 months',
  dateSummaryLast6Months: 'Last 6 months',
  dateSummaryCustom: 'Custom',
};

async function renderControls(overrides: Partial<BudgetReportControlsProps> = {}) {
  const onPeriodChange = jest.fn();
  const onCategoryChange = jest.fn();
  const onCustomStartChange = jest.fn();
  const onCustomEndChange = jest.fn();

  const props: BudgetReportControlsProps = {
    locale: 'en',
    period: 'thisMonth',
    categoryFilter: 'all',
    customStart: '',
    customEnd: '',
    labels: defaultLabels,
    onPeriodChange,
    onCategoryChange,
    onCustomStartChange,
    onCustomEndChange,
    ...overrides,
  };

  const result = await render(
    <ThemeProvider mode="light">
      <BudgetReportControls {...props} />
    </ThemeProvider>,
  );

  return {
    ...result,
    onPeriodChange,
    onCategoryChange,
  };
}

describe('BudgetReportControls', () => {
  it('opens date sheet and applies last month preset', async () => {
    const { getByTestId, findByTestId, onPeriodChange } = await renderControls();

    fireEvent.press(getByTestId('budget-date-calendar'));
    const option = await findByTestId('budget-period-lastMonth');
    fireEvent.press(option);
    expect(onPeriodChange).toHaveBeenCalledWith('lastMonth');
  });

  it('opens category menu and selects a category', async () => {
    const { getByTestId, findByTestId, onCategoryChange } = await renderControls();

    fireEvent.press(getByTestId('budget-filter-category-menu'));
    const option = await findByTestId('budget-filter-category-option-food');
    fireEvent.press(option);
    expect(onCategoryChange).toHaveBeenCalledWith('food');
  });

  it('shows custom date fields in sheet when custom is selected', async () => {
    const { getByTestId, findByTestId } = await renderControls();

    fireEvent.press(getByTestId('budget-date-calendar'));
    fireEvent.press(await findByTestId('budget-period-custom'));
    expect(await findByTestId('filter-date-custom-from')).toBeTruthy();
    expect(await findByTestId('filter-date-custom-to')).toBeTruthy();
  });
});
