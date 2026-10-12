import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders search-input and forwards text changes', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <SearchBar
          accessibilityLabel="Search transactions"
          onChangeText={onChangeText}
          placeholder="Search"
          value=""
        />
      </ThemeProvider>,
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'John');
    expect(onChangeText).toHaveBeenCalledWith('John');
  });
});
