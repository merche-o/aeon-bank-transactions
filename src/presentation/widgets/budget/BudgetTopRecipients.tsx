import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BudgetTopRecipientRow = {
  recipientName: string;
  formatted: string;
  percentLabel: string;
};

export type BudgetTopRecipientsProps = {
  rows: BudgetTopRecipientRow[];
  title: string;
  emptyLabel: string;
};

export function BudgetTopRecipients({ rows, title, emptyLabel }: BudgetTopRecipientsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          marginHorizontal: spacing.lg,
          padding: spacing.lg,
        },
      ]}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.md,
        }}
      >
        {title}
      </Text>

      {rows.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>{emptyLabel}</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rows.map((row, index) => (
            <View key={`${row.recipientName}-${index}`} style={styles.row} testID={`budget-recipient-${index}`}>
              <View style={[styles.rankBadge, { backgroundColor: colors.primarySubtle }]}>
                <Text
                  style={{
                    color: colors.primaryMuted,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <View style={styles.labelCol}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {row.recipientName}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs }}>
                  {row.percentLabel}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {row.formatted}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  labelCol: {
    flex: 1,
    gap: 2,
  },
  rankBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
