import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BudgetCategoryLegendRow = {
  category: string;
  label: string;
  formatted: string;
  percentLabel: string;
  color: string;
};

export type BudgetCategoryLegendProps = {
  rows: BudgetCategoryLegendRow[];
  title: string;
  emptyLabel: string;
};

export function BudgetCategoryLegend({ rows, title, emptyLabel }: BudgetCategoryLegendProps) {
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
        },
      ]}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.md,
        }}
      >
        {title}
      </Text>

      {rows.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>{emptyLabel}</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {rows.map((row) => (
            <View
              key={row.category}
              style={styles.row}
              testID={`budget-category-${row.category}`}
            >
              <View style={[styles.swatch, { backgroundColor: row.color }]} />
              <View style={styles.labelCol}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {row.label}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs }}>
                  {row.percentLabel}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {row.formatted}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  labelCol: {
    flex: 1,
    gap: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  swatch: {
    borderRadius: 4,
    height: 12,
    width: 12,
  },
});
