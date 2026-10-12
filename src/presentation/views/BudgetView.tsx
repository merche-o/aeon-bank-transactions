import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useBudgetViewModel } from '../viewmodels/useBudgetViewModel';

export function BudgetView() {
  const vm = useBudgetViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="budget-screen"
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.lg,
          }}
        >
          {vm.labels.title}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              marginBottom: spacing.xl,
              padding: spacing.lg,
            },
          ]}
        >
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing.md,
            }}
          >
            {vm.labels.thisMonth}
          </Text>
          <View style={styles.summaryRow}>
            <SummaryBlock
              label={vm.labels.income}
              testID="budget-income"
              tone="success"
              value={vm.incomeFormatted}
            />
            <SummaryBlock
              label={vm.labels.expenses}
              testID="budget-expenses"
              tone="error"
              value={vm.expensesFormatted}
            />
          </View>
        </View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.md,
          }}
        >
          {vm.labels.byMonth}
        </Text>
        <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
          {vm.monthlyBars.map((month) => {
            const widthPct = (month.expenseTotal / vm.maxMonthlyExpense) * 100;
            return (
              <View key={month.monthKey} testID={`budget-bar-${month.monthKey}`}>
                <View style={styles.barLabelRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                    {month.label}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs }}>
                    {month.expenseTotal.toLocaleString('en-MY', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: colors.borderSubtle, marginTop: spacing.xxs },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.max(widthPct, month.expenseTotal > 0 ? 4 : 0)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.md,
          }}
        >
          {vm.labels.byCategory}
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              padding: spacing.lg,
            },
          ]}
        >
          {vm.categorySpend.length === 0 ? (
            <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>—</Text>
          ) : (
            vm.categorySpend.map((row) => (
              <View
                key={row.category}
                style={[
                  styles.categoryRow,
                  { borderBottomColor: colors.borderSubtle, paddingVertical: spacing.sm },
                ]}
                testID={`budget-category-${row.category}`}
              >
                <Text style={{ color: colors.textPrimary, fontSize: typography.fontSize.md }}>
                  {row.label}
                </Text>
                <Text
                  style={{
                    color: colors.error,
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {row.formatted}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryBlock({
  label,
  value,
  testID,
  tone,
}: {
  label: string;
  value: string;
  testID: string;
  tone: 'success' | 'error';
}) {
  const theme = useTheme();
  const { colors, typography, spacing } = theme;
  const valueColor = tone === 'success' ? colors.success : colors.error;

  return (
    <View style={styles.summaryBlock} testID={testID}>
      <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs, marginBottom: spacing.xxs }}>
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
  barFill: {
    borderRadius: 6,
    height: '100%',
    minWidth: 0,
  },
  barLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barTrack: {
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  summaryBlock: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
