import { fireEvent, render } from '@testing-library/react-native';

import type { Transaction } from '@/models/Transaction';
import { ThemeProvider } from '@/theme';

import { TransactionCard } from '../TransactionCard';

const sample: Transaction = {
  refId: 'TX-001',
  transferDate: '2024-06-15T10:00:00.000Z',
  recipientName: 'Aeon Retail',
  transferName: 'Purchase',
  amount: -88.9,
  category: 'food',
};

describe('TransactionCard', () => {
  it('shows transaction fields and handles press', async () => {
    const onPress = jest.fn();

    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <TransactionCard locale="en" onPress={onPress} transaction={sample} />
      </ThemeProvider>,
    );

    expect(getByTestId('transaction-card-TX-001')).toBeTruthy();
    expect(getByText('Aeon Retail')).toBeTruthy();
    expect(getByText('Purchase')).toBeTruthy();
    expect(getByText('-RM 88.90')).toBeTruthy();

    fireEvent.press(getByTestId('transaction-card-TX-001'));
    expect(onPress).toHaveBeenCalledWith('TX-001');
  });
});
