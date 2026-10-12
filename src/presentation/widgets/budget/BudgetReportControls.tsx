import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Locale } from '@/i18n/types';
import type { CategoryFilter } from '@/models/Transaction';
import { TRANSACTION_CATEGORIES } from '@/models/Transaction';
import { useTheme } from '@/theme';
import type { BudgetPeriodPreset } from '@/utils/budgetStats';
import { getCategoryLabel } from '@/utils/categories';

import { DateRangePickerSheet } from '../DateRangePickerSheet';
import { FilterMenuButton } from '../FilterMenuButton';

export type { BudgetPeriodPreset };

export type BudgetReportControlsProps = {
  locale: Locale;
  period: BudgetPeriodPreset;
  categoryFilter: CategoryFilter;
  customStart: string;
  customEnd: string;
  labels: {
    category: string;
    categoryAll: string;
    dateTitle: string;
    thisMonth: string;
    lastMonth: string;
    last3Months: string;
    last6Months: string;
    custom: string;
    apply: string;
    dateSummaryThisMonth: string;
    dateSummaryLastMonth: string;
    dateSummaryLast3Months: string;
    dateSummaryLast6Months: string;
    dateSummaryCustom: string;
  };
  onPeriodChange: (period: BudgetPeriodPreset) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onCustomStartChange: (iso: string) => void;
  onCustomEndChange: (iso: string) => void;
};

export function BudgetReportControls({
  locale,
  period,
  categoryFilter,
  customStart,
  customEnd,
  labels,
  onPeriodChange,
  onCategoryChange,
  onCustomStartChange,
  onCustomEndChange,
}: BudgetReportControlsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const categoryOptions = useMemo(
    () => [
      {
        value: 'all' as const,
        label: labels.categoryAll,
        testID: 'budget-filter-category-option-all',
      },
      ...TRANSACTION_CATEGORIES.map((category) => ({
        value: category,
        label: getCategoryLabel(category, locale),
        testID: `budget-filter-category-option-${category}`,
      })),
    ],
    [labels.categoryAll, locale],
  );

  const dateSummary =
    period === 'lastMonth'
      ? labels.dateSummaryLastMonth
      : period === 'last3Months'
        ? labels.dateSummaryLast3Months
        : period === 'last6Months'
          ? labels.dateSummaryLast6Months
          : period === 'custom'
            ? labels.dateSummaryCustom
            : labels.dateSummaryThisMonth;

  const dateActive = period !== 'thisMonth';

  return (
    <View style={{ marginBottom: spacing.md, paddingHorizontal: spacing.lg }}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <FilterMenuButton
          label={labels.category}
          onChange={onCategoryChange}
          options={categoryOptions}
          testID="budget-filter-category-menu"
          value={categoryFilter}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setDateSheetOpen(true)}
          style={({ pressed }) => [
            styles.calendarButton,
            {
              backgroundColor: colors.surface,
              borderColor: dateActive ? colors.primary : colors.borderSubtle,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            },
          ]}
          testID="budget-date-calendar"
        >
          <Ionicons
            color={dateActive ? colors.primary : colors.textSecondary}
            name="calendar-outline"
            size={22}
          />
          <Text
            numberOfLines={1}
            style={{
              color: dateActive ? colors.primary : colors.textMuted,
              fontSize: typography.fontSize.xs,
              marginTop: 2,
              maxWidth: 88,
              textAlign: 'center',
            }}
          >
            {dateSummary}
          </Text>
        </Pressable>
      </View>

      <DateRangePickerSheet
        applyTestID="budget-date-apply"
        backdropTestID="budget-date-sheet-backdrop"
        customEnd={customEnd}
        customStart={customStart}
        customValue="custom"
        labels={{
          title: labels.dateTitle,
          apply: labels.apply,
        }}
        locale={locale}
        onChangeEnd={onCustomEndChange}
        onChangeStart={onCustomStartChange}
        onClose={() => setDateSheetOpen(false)}
        onSelectPreset={onPeriodChange}
        presets={[
          {
            value: 'thisMonth',
            label: labels.thisMonth,
            testID: 'budget-period-thisMonth',
          },
          {
            value: 'lastMonth',
            label: labels.lastMonth,
            testID: 'budget-period-lastMonth',
          },
          {
            value: 'last3Months',
            label: labels.last3Months,
            testID: 'budget-period-last3Months',
          },
          {
            value: 'last6Months',
            label: labels.last6Months,
            testID: 'budget-period-last6Months',
          },
          {
            value: 'custom',
            label: labels.custom,
            testID: 'budget-period-custom',
          },
        ]}
        value={period}
        visible={dateSheetOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 64,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
});
