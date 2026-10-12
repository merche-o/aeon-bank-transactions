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
            label={labels.upcoming}
            sublabel={
              upcomingCount !== undefined && upcomingCount > 0
                ? String(upcomingCount)
                : undefined
            }
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
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>{label}</Text>
        {sublabel ? (
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs }}>{sublabel}</Text>
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
