import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/models/Transaction';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/formatDate';

import { AmountText } from './AmountText';

export type TransactionCardProps = {
  transaction: Transaction;
  onPress: (refId: string) => void;
};

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(transaction.refId)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.92 : 1,
          padding: spacing.lg,
        },
      ]}
      testID={`transaction-card-${transaction.refId}`}
    >
      <View style={styles.row}>
        <View style={styles.main}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.textPrimary,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {transaction.recipientName}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              marginTop: spacing.xxs,
            }}
          >
            {transaction.transferName}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.xs,
              marginTop: spacing.xs,
            }}
          >
            {formatDate(transaction.transferDate)}
          </Text>
        </View>
        <AmountText amount={transaction.amount} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  main: {
    flex: 1,
    marginRight: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
