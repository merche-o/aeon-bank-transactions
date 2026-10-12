import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type BudgetMonthOutlookProps = {
  dailyAverageFormatted?: string;
  projectedFormatted?: string;
  upcomingFormatted?: string;
  upcomingCount?: number;
  labels: {
    title: string;
    dailyAverage: string;
    projected: string;
    upcoming: string;
  };
  visible: boolean;
};

export function BudgetMonthOutlook({
  dailyAverageFormatted,
  projectedFormatted,
  upcomingFormatted,
  upcomingCount,
  labels,
  visible,
}: BudgetMonthOutlookProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          marginHorizontal: spacing.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
      ]}
      testID="budget-outlook"
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {labels.title}
      </Text>

      <View style={{ gap: spacing.sm }}>
        {dailyAverageFormatted !== undefined ? (
          <OutlookRow label={labels.dailyAverage} value={dailyAverageFormatted} />
        ) : null}
        {projectedFormatted !== undefined ? (
          <OutlookRow label={labels.projected} value={projectedFormatted} />
        ) : null}
        {upcomingFormatted !== undefined ? (
          <OutlookRow
            countBadge={
              upcomingCount !== undefined && upcomingCount > 0 ? upcomingCount : undefined
            }
            label={labels.upcoming}
            value={upcomingFormatted}
          />
        ) : null}
      </View>
    </View>
  );
}

function OutlookRow({
  label,
  value,
  countBadge,
}: {
  label: string;
  value: string;
  countBadge?: number;
}) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>{label}</Text>
        {countBadge !== undefined ? (
          <View
            style={[styles.countBadge, { backgroundColor: colors.navy }]}
            testID="budget-upcoming-count"
          >
            <Text
              style={{
                color: colors.textInverse,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {countBadge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
  },
  countBadge: {
    alignItems: 'center',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 6,
  },
  labelRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
