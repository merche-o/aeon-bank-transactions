import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BudgetCashFlowHeroProps = {
  incomeFormatted: string;
  expensesFormatted: string;
  netFormatted: string;
  netPositive: boolean;
  vsPriorLabel?: string;
  labels: {
    thisPeriod: string;
    income: string;
    expenses: string;
    net: string;
  };
};

export function BudgetCashFlowHero({
  incomeFormatted,
  expensesFormatted,
  netFormatted,
  netPositive,
  vsPriorLabel,
  labels,
}: BudgetCashFlowHeroProps) {
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
          gap: spacing.md,
        },
      ]}
    >
      <View style={{ gap: spacing.xxs }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
          }}
        >
          {labels.thisPeriod}
        </Text>
        {vsPriorLabel ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.xs,
            }}
          >
            {vsPriorLabel}
          </Text>
        ) : null}
      </View>

      <View style={[styles.metricsRow, { gap: spacing.md }]}>
        <MetricBlock
          label={labels.income}
          testID="budget-income"
          value={incomeFormatted}
          valueColor={colors.success}
        />
        <MetricBlock
          label={labels.expenses}
          testID="budget-expenses"
          value={expensesFormatted}
          valueColor={colors.error}
        />
      </View>

      <View
        style={[
          styles.netRow,
          {
            backgroundColor: netPositive ? colors.successMuted : colors.errorMuted,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {labels.net}
        </Text>
        <Text
          style={{
            color: netPositive ? colors.success : colors.error,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
          }}
          testID="budget-net"
        >
          {netFormatted}
        </Text>
      </View>
    </View>
  );
}

function MetricBlock({
  label,
  value,
  valueColor,
  testID,
}: {
  label: string;
  value: string;
  valueColor: string;
  testID: string;
}) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={styles.metricBlock} testID={testID}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.xs,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: valueColor,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  metricBlock: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  netRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
