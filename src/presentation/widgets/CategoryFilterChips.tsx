import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Locale } from '@/i18n/types';
import {
  TRANSACTION_CATEGORIES,
  type CategoryFilter,
  type TransactionCategory,
} from '@/models/Transaction';
import { useTheme } from '@/theme';
import { getCategoryLabel } from '@/utils/categories';
import { t } from '@/i18n';

export type CategoryFilterChipsProps = {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  locale: Locale;
};

export function CategoryFilterChips({ value, onChange, locale }: CategoryFilterChipsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const options: { value: CategoryFilter; label: string; testID: string }[] = [
    {
      value: 'all',
      label: t('filters.categoryAll', locale),
      testID: 'filter-category-all',
    },
    ...TRANSACTION_CATEGORIES.map((cat: TransactionCategory) => ({
      value: cat as CategoryFilter,
      label: getCategoryLabel(cat, locale),
      testID: `filter-category-${cat}`,
    })),
  ];

  return (
    <View style={[styles.section, { marginBottom: spacing.sm }]}>
      <ScrollView
        contentContainerStyle={[styles.row, { gap: spacing.sm, paddingHorizontal: spacing.lg }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? colors.primarySubtle : colors.surface,
                  borderColor: selected ? colors.primary : colors.borderSubtle,
                  opacity: pressed ? 0.88 : 1,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                },
              ]}
              testID={option.testID}
            >
              <Text
                style={{
                  color: selected ? colors.primaryMuted : colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: selected
                    ? typography.fontWeight.semibold
                    : typography.fontWeight.medium,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  section: {},
});
