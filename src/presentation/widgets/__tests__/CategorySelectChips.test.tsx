import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { CategorySelectChips } from '../CategorySelectChips';

describe('CategorySelectChips', () => {
  it('does not render unknown and selects categories', async () => {
    const onChange = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <ThemeProvider mode="light">
        <CategorySelectChips
          locale="en"
          onChange={onChange}
          value="unknown"
        />
      </ThemeProvider>,
    );

    expect(queryByTestId('category-select-unknown')).toBeNull();
    fireEvent.press(getByTestId('category-select-food'));
    expect(onChange).toHaveBeenCalledWith('food');
  });

  it('toggles off selected chip to unknown', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <CategorySelectChips locale="en" onChange={onChange} value="food" />
      </ThemeProvider>,
    );

    fireEvent.press(getByTestId('category-select-food'));
    expect(onChange).toHaveBeenCalledWith('unknown');
  });
});
