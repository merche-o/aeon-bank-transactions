import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BudgetChartMonth = {
  monthKey: string;
  label: string;
  incomeTotal: number;
  expenseTotal: number;
  incomeFormatted: string;
  expenseFormatted: string;
};

export type BudgetIncomeExpenseChartProps = {
  months: BudgetChartMonth[];
  labels: { title: string; income: string; expenses: string };
};

const BAR_MAX_HEIGHT = 96;
const BAR_WIDTH = 14;
const GROUP_GAP = 4;

export function BudgetIncomeExpenseChart({ months, labels }: BudgetIncomeExpenseChartProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const maxValue = Math.max(
    1,
    ...months.flatMap((m) => [m.incomeTotal, m.expenseTotal]),
  );

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
      testID="budget-chart"
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.sm,
        }}
      >
        {labels.title}
      </Text>

      <View style={[styles.legendRow, { gap: spacing.md, marginBottom: spacing.md }]}>
        <LegendDot color={colors.success} label={labels.income} />
        <LegendDot color={colors.error} label={labels.expenses} />
      </View>

      <View style={[styles.chartRow, { gap: spacing.sm }]}>
        {months.map((month) => {
          const incomeHeight = (month.incomeTotal / maxValue) * BAR_MAX_HEIGHT;
          const expenseHeight = (month.expenseTotal / maxValue) * BAR_MAX_HEIGHT;

          return (
            <View
              key={month.monthKey}
              style={styles.monthColumn}
              testID={`budget-bar-${month.monthKey}`}
            >
              <View style={[styles.barPair, { gap: GROUP_GAP, height: BAR_MAX_HEIGHT }]}>
                <View style={styles.barSlot}>
                  <View
                    accessibilityLabel={month.incomeFormatted}
                    style={[
                      styles.bar,
                      {
                        backgroundColor: colors.success,
                        height: Math.max(2, incomeHeight),
                        width: BAR_WIDTH,
                      },
                    ]}
                  />
                </View>
                <View style={styles.barSlot}>
                  <View
                    accessibilityLabel={month.expenseFormatted}
                    style={[
                      styles.bar,
                      {
                        backgroundColor: colors.error,
                        height: Math.max(2, expenseHeight),
                        width: BAR_WIDTH,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.textMuted,
                  fontSize: typography.fontSize.xs,
                  marginTop: spacing.xs,
                  maxWidth: BAR_WIDTH * 2 + GROUP_GAP + 8,
                  textAlign: 'center',
                }}
              >
                {month.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.xs }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 4,
  },
  barPair: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  barSlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
  },
  monthColumn: {
    alignItems: 'center',
    flex: 1,
  },
});
