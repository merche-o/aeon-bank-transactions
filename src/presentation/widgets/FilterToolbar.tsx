import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Locale } from '@/i18n/types';
import type {
  CategoryFilter,
  DateRangeFilter,
  TypeFilter,
} from '@/models/Transaction';
import { TRANSACTION_CATEGORIES } from '@/models/Transaction';
import { getCategoryLabel } from '@/utils/categories';
import { useTheme } from '@/theme';

import { DateRangePickerSheet } from './DateRangePickerSheet';
import { FilterMenuButton } from './FilterMenuButton';

export type FilterToolbarProps = {
  locale: Locale;
  typeFilter: TypeFilter;
  categoryFilter: CategoryFilter;
  dateRange: DateRangeFilter;
  customStart: string;
  customEnd: string;
  typeOptions: ReadonlyArray<{ value: TypeFilter; label: string; testID: string }>;
  labels: {
    type: string;
    category: string;
    categoryAll: string;
    dateTitle: string;
    dateAll: string;
    lastWeek: string;
    lastMonth: string;
    dateCustom: string;
    apply: string;
    dateSummaryAll: string;
    dateSummary7d: string;
    dateSummary30d: string;
    dateSummaryCustom: string;
  };
  onChangeType: (value: TypeFilter) => void;
  onChangeCategory: (value: CategoryFilter) => void;
  onChangeDateRange: (value: DateRangeFilter) => void;
  onChangeStart: (iso: string) => void;
  onChangeEnd: (iso: string) => void;
};

export function FilterToolbar({
  locale,
  typeFilter,
  categoryFilter,
  dateRange,
  customStart,
  customEnd,
  typeOptions,
  labels,
  onChangeType,
  onChangeCategory,
  onChangeDateRange,
  onChangeStart,
  onChangeEnd,
}: FilterToolbarProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  const categoryOptions = useMemo(
    () => [
      {
        value: 'all' as const,
        label: labels.categoryAll,
        testID: 'filter-category-option-all',
      },
      ...TRANSACTION_CATEGORIES.map((category) => ({
        value: category,
        label: getCategoryLabel(category, locale),
        testID: `filter-category-option-${category}`,
      })),
    ],
    [labels.categoryAll, locale],
  );

  const dateSummary =
    dateRange === '7d'
      ? labels.dateSummary7d
      : dateRange === '30d'
        ? labels.dateSummary30d
        : dateRange === 'custom'
          ? labels.dateSummaryCustom
          : labels.dateSummaryAll;

  return (
    <View style={{ marginBottom: spacing.md, paddingHorizontal: spacing.lg }}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <FilterMenuButton
          label={labels.type}
          onChange={onChangeType}
          options={typeOptions.map((option) => ({
            ...option,
            testID: option.testID.replace('filter-type-', 'filter-type-option-'),
          }))}
          testID="filter-type-menu"
          value={typeFilter}
        />
        <FilterMenuButton
          label={labels.category}
          onChange={onChangeCategory}
          options={categoryOptions}
          testID="filter-category-menu"
          value={categoryFilter}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setDateSheetOpen(true)}
          style={({ pressed }) => [
            styles.calendarButton,
            {
              backgroundColor: colors.surface,
              borderColor:
                dateRange !== 'all' ? colors.primary : colors.borderSubtle,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
            },
          ]}
          testID="filter-date-calendar"
        >
          <Ionicons
            color={dateRange !== 'all' ? colors.primary : colors.textSecondary}
            name="calendar-outline"
            size={22}
          />
          <Text
            numberOfLines={1}
            style={{
              color: dateRange !== 'all' ? colors.primary : colors.textMuted,
              fontSize: typography.fontSize.xs,
              marginTop: 2,
              maxWidth: 72,
              textAlign: 'center',
            }}
          >
            {dateSummary}
          </Text>
        </Pressable>
      </View>

      <DateRangePickerSheet
        customEnd={customEnd}
        customStart={customStart}
        customValue="custom"
        labels={{
          title: labels.dateTitle,
          apply: labels.apply,
        }}
        locale={locale}
        onChangeEnd={onChangeEnd}
        onChangeStart={onChangeStart}
        onClose={() => setDateSheetOpen(false)}
        onSelectPreset={onChangeDateRange}
        presets={[
          { value: 'all', label: labels.dateAll, testID: 'filter-date-preset-all' },
          { value: '7d', label: labels.lastWeek, testID: 'filter-date-preset-7d' },
          {
            value: '30d',
            label: labels.lastMonth,
            testID: 'filter-date-preset-30d',
          },
          {
            value: 'custom',
            label: labels.dateCustom,
            testID: 'filter-date-preset-custom',
          },
        ]}
        value={dateRange}
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
