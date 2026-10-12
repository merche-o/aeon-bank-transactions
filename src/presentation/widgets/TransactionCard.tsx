import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import type { Transaction } from '@/models/Transaction';
import { useTheme } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import { AmountText } from './AmountText';
import { CategoryBadge } from './CategoryBadge';

export type TransactionCardProps = {
  transaction: Transaction;
  onPress: (refId: string) => void;
  locale: Locale;
};

export function TransactionCard({ transaction, onPress, locale }: TransactionCardProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const isPending = transaction.status === 'pending';
  const accessibilityLabel = `${transaction.recipientName}, ${transaction.transferName}, ${formatCurrency(transaction.amount)}`;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
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
          <View style={[styles.badges, { marginTop: spacing.xs, gap: spacing.xs }]}>
            <CategoryBadge category={transaction.category} locale={locale} />
            {isPending ? (
              <View
                style={[
                  styles.pendingBadge,
                  {
                    backgroundColor: colors.primarySubtle,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xxs,
                  },
                ]}
                testID={`pending-badge-${transaction.refId}`}
              >
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {t('status.pending', locale)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <AmountText amount={transaction.amount} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  main: {
    flex: 1,
    marginRight: 12,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
