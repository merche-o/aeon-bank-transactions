import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BudgetCashFlowHero,
  BudgetCategoryDonut,
  BudgetCategoryLegend,
  BudgetEmptyState,
  BudgetIncomeExpenseChart,
  BudgetMonthOutlook,
  BudgetReportControls,
  BudgetTopRecipients,
} from '@/presentation/widgets/budget';
import { useTheme } from '@/theme';

import { useBudgetViewModel } from '../viewmodels/useBudgetViewModel';

const CATEGORY_PALETTE = [
  'primary',
  'accent',
  'navy',
  'success',
  'error',
  'primaryMuted',
] as const;

function resolveSliceColor(
  colors: ReturnType<typeof useTheme>['colors'],
  index: number,
): string {
  const key = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
  return colors[key];
}

export function BudgetView() {
  const vm = useBudgetViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const showReport = !vm.loading;

  const categoryWithColors = vm.categoryRows.map((row, index) => ({
    ...row,
    color: resolveSliceColor(colors, index),
  }));

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="budget-screen"
    >
      <ScrollView
        contentContainerStyle={{
          gap: spacing.xl,
          paddingBottom: spacing.xxxl,
          paddingTop: spacing.lg,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
            paddingHorizontal: spacing.lg,
          }}
        >
          {vm.labels.title}
        </Text>

        {showReport ? (
          <BudgetReportControls
            categoryFilter={vm.categoryFilter}
            customEnd={vm.customEnd}
            customStart={vm.customStart}
            labels={vm.labels.controls}
            locale={vm.locale}
            onCategoryChange={vm.setCategoryFilter}
            onCustomEndChange={vm.setCustomEnd}
            onCustomStartChange={vm.setCustomStart}
            onPeriodChange={vm.setPeriod}
            period={vm.period}
          />
        ) : null}

        {vm.loading ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.md,
              paddingHorizontal: spacing.lg,
            }}
          >
            {vm.labels.loading}
          </Text>
        ) : vm.isEmpty ? (
          <BudgetEmptyState message={vm.labels.empty} />
        ) : vm.noMatching ? (
          <BudgetEmptyState message={vm.labels.noMatching} testID="budget-no-matching" />
        ) : (
          <>
            <BudgetCashFlowHero
              expensesFormatted={vm.expensesFormatted}
              incomeFormatted={vm.incomeFormatted}
              labels={vm.labels.hero}
              netFormatted={vm.netFormatted}
              netPositive={vm.netPositive}
              vsPriorLabel={vm.vsPriorLabel}
            />

            <BudgetIncomeExpenseChart labels={vm.labels.chart} months={vm.monthlyBars} />

            <View style={[styles.donutSection, { gap: spacing.lg, paddingHorizontal: spacing.lg }]}>
              <BudgetCategoryDonut
                centerLabel={vm.labels.category.title}
                slices={categoryWithColors.map((row) => ({
                  category: row.category,
                  color: row.color,
                  percent: row.percent,
                  total: row.total,
                }))}
              />
              <View style={styles.legendFlex}>
                <BudgetCategoryLegend
                  emptyLabel={vm.labels.category.empty}
                  rows={categoryWithColors.map((row) => ({
                    category: row.category,
                    color: row.color,
                    formatted: row.formatted,
                    label: row.label,
                    percentLabel: row.percentLabel,
                  }))}
                  title={vm.labels.category.title}
                />
              </View>
            </View>

            <BudgetTopRecipients
              emptyLabel={vm.labels.topRecipients.empty}
              rows={vm.topRecipientRows}
              title={vm.labels.topRecipients.title}
            />

            <BudgetMonthOutlook
              dailyAverageFormatted={vm.outlook.dailyAverageFormatted}
              labels={vm.labels.outlook}
              projectedFormatted={vm.outlook.projectedFormatted}
              upcomingCount={vm.outlook.upcomingCount}
              upcomingFormatted={vm.outlook.upcomingFormatted}
              visible={vm.outlookVisible}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  donutSection: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  flex: {
    flex: 1,
  },
  legendFlex: {
    alignSelf: 'stretch',
  },
});
