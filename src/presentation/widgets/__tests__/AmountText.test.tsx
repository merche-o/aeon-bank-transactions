import { render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { AmountText } from '../AmountText';

describe('AmountText', () => {
  it('renders formatted positive amount with success tone', async () => {
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <AmountText amount={120.5} testID="amount" />
      </ThemeProvider>,
    );

    const node = getByTestId('amount');
    expect(node).toHaveTextContent('RM 120.50');
    expect(node.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#15803D' }),
      ]),
    );
  });

  it('renders formatted negative amount with error tone', async () => {
    const { getByTestId } = await render(
      <ThemeProvider mode="light">
        <AmountText amount={-45} testID="amount" />
      </ThemeProvider>,
    );

    const node = getByTestId('amount');
    expect(node).toHaveTextContent('-RM 45.00');
    expect(node.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#B91C1C' }),
      ]),
    );
  });
});
