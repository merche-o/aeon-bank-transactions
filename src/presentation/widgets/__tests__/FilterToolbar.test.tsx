import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { FilterToolbar } from '../FilterToolbar';

const labels = {
  type: 'Type',
  category: 'Category',
  categoryAll: 'All categories',
  dateTitle: 'Date',
  dateAll: 'All time',
  lastWeek: 'Last 7 days',
  lastMonth: 'Last 30 days',
  dateCustom: 'Custom',
  apply: 'Apply',
  dateSummaryAll: 'All time',
  dateSummary7d: 'Last 7 days',
  dateSummary30d: 'Last 30 days',
  dateSummaryCustom: 'Custom',
};

describe('FilterToolbar', () => {
  it('exposes type/category menus and date calendar testIDs', async () => {
    const onChangeType = jest.fn();
    const onChangeCategory = jest.fn();
    const onChangeDateRange = jest.fn();

    const { getByTestId, findByTestId } = await render(
      <ThemeProvider mode="light">
        <FilterToolbar
          categoryFilter="all"
          customEnd=""
          customStart=""
          dateRange="all"
          labels={labels}
          locale="en"
          onChangeCategory={onChangeCategory}
          onChangeDateRange={onChangeDateRange}
          onChangeEnd={jest.fn()}
          onChangeStart={jest.fn()}
          onChangeType={onChangeType}
          typeFilter="all"
          typeOptions={[
            { value: 'all', label: 'All', testID: 'filter-type-all' },
            {
              value: 'incoming',
              label: 'Incoming',
              testID: 'filter-type-incoming',
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(getByTestId('filter-type-menu')).toBeTruthy();
    expect(getByTestId('filter-category-menu')).toBeTruthy();
    expect(getByTestId('filter-date-calendar')).toBeTruthy();

    fireEvent.press(getByTestId('filter-type-menu'));
    const typeOption = await findByTestId('filter-type-option-incoming');
    fireEvent.press(typeOption);
    await waitFor(() => {
      expect(onChangeType).toHaveBeenCalledWith('incoming');
    });

    fireEvent.press(getByTestId('filter-category-menu'));
    const categoryOption = await findByTestId('filter-category-option-food');
    fireEvent.press(categoryOption);
    await waitFor(() => {
      expect(onChangeCategory).toHaveBeenCalledWith('food');
    });

    fireEvent.press(getByTestId('filter-date-calendar'));
    const preset = await findByTestId('filter-date-preset-7d');
    fireEvent.press(preset);
    await waitFor(() => {
      expect(onChangeDateRange).toHaveBeenCalledWith('7d');
    });
  });
});
