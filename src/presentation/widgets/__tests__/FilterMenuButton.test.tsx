import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { FilterMenuButton } from '../FilterMenuButton';

describe('FilterMenuButton', () => {
  it('opens a menu and selects an option', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByTestId } = await render(
      <ThemeProvider mode="light">
        <FilterMenuButton
          label="Type"
          onChange={onChange}
          options={[
            { value: 'all', label: 'All', testID: 'filter-type-option-all' },
            {
              value: 'incoming',
              label: 'Incoming',
              testID: 'filter-type-option-incoming',
            },
          ]}
          testID="filter-type-menu"
          value="all"
        />
      </ThemeProvider>,
    );

    fireEvent.press(getByTestId('filter-type-menu'));
    const option = await findByTestId('filter-type-option-incoming');
    fireEvent.press(option);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('incoming');
    });
  });
});
