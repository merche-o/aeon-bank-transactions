import { StyleSheet, Text, View } from 'react-native';

import type { Locale } from '@/i18n/types';
import type { TransactionCategory } from '@/models/Transaction';
import { useTheme } from '@/theme';
import { getCategoryLabel } from '@/utils/categories';

export type CategoryBadgeProps = {
  category: TransactionCategory;
  locale: Locale;
};

export function CategoryBadge({ category, locale }: CategoryBadgeProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.primarySubtle,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xxs,
        },
      ]}
      testID={`category-badge-${category}`}
    >
      <Text
        style={{
          color: colors.primaryMuted,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {getCategoryLabel(category, locale)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
  },
});
