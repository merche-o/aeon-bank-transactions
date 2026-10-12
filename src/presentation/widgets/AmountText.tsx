import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme';
import { amountColor } from '@/utils/amountColor';
import { formatCurrency } from '@/utils/formatCurrency';

export type AmountTextProps = TextProps & {
  amount: number;
  testID?: string;
};

export function AmountText({ amount, style, testID, ...rest }: AmountTextProps) {
  const theme = useTheme();
  const sign = amountColor(amount);
  const color =
    sign === 'positive' ? theme.colors.success : theme.colors.error;

  return (
    <Text
      {...rest}
      style={[
        styles.amount,
        {
          color,
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.semibold,
        },
        style,
      ]}
      testID={testID ?? 'amount-text'}
    >
      {formatCurrency(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontVariant: ['tabular-nums'],
  },
});
