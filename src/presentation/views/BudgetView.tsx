import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BudgetCashFlowHero,
  BudgetCategoryDonut,
  BudgetCategoryLegend,
  BudgetEmptyState,
  BudgetIncomeExpenseChart,
  BudgetMonthOutlook,
  BudgetReportControls,
  BudgetTopFlows,
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
        <View
          style={[
            styles.headerRow,
            {
              marginHorizontal: spacing.lg,
            },
          ]}
        >
          <View style={styles.headerText}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSize.xxl,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {vm.labels.title}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                marginTop: spacing.xxs,
              }}
            >
              {vm.labels.balance}
            </Text>
            <Text
              style={{
                color: colors.navy,
                fontSize: typography.fontSize.xxl,
                fontWeight: typography.fontWeight.bold,
                marginTop: spacing.xxs,
              }}
              testID="budget-balance-amount"
            >
              {vm.balanceFormatted}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={vm.labels.settings}
            accessibilityRole="button"
            onPress={vm.openDrawer}
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
            testID="budget-settings-button"
          >
            <Ionicons color={colors.primary} name="settings-outline" size={24} />
          </Pressable>
        </View>

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

            <View style={[styles.donutSection, { gap: spacing.lg }]}>
              <BudgetCategoryDonut
                centerLabel={vm.categorySpendTotalFormatted}
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

            <BudgetTopFlows
              earningRows={vm.topEarningRows}
              earningTitle={vm.labels.topFlows.earningTitle}
              emptyLabel={vm.labels.topFlows.empty}
              spendingRows={vm.topSpendingRows}
              spendingTitle={vm.labels.topFlows.spendingTitle}
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
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  iconButton: {
    padding: 4,
  },
  legendFlex: {
    alignSelf: 'stretch',
  },
});
