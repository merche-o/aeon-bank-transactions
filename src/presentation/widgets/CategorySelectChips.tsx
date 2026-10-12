import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Locale } from '@/i18n/types';
import { TRANSACTION_CATEGORIES, type TransactionCategory } from '@/models/Transaction';
import { useTheme } from '@/theme';
import { getCategoryLabel } from '@/utils/categories';

export type CategorySelectChipsProps = {
  value: TransactionCategory;
  onChange: (value: TransactionCategory) => void;
  locale: Locale;
  testIDPrefix?: string;
};

export function CategorySelectChips({
  value,
  onChange,
  locale,
  testIDPrefix = 'category-select',
}: CategorySelectChipsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View style={styles.section}>
      <ScrollView
        contentContainerStyle={[styles.row, { gap: spacing.sm }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {TRANSACTION_CATEGORIES.map((cat) => {
          const selected = cat === value;
          return (
            <Pressable
              key={cat}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(cat)}
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
              testID={`${testIDPrefix}-${cat}`}
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
                {getCategoryLabel(cat, locale)}
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
