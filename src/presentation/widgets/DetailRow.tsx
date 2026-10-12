import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type DetailRowProps = {
  label: string;
  value: string;
  testID?: string;
  /** `stacked` = label above value; `inline` = label left, value right */
  variant?: 'stacked' | 'inline';
};

export function DetailRow({
  label,
  value,
  testID,
  variant = 'stacked',
}: DetailRowProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  if (variant === 'inline') {
    return (
      <View style={styles.inlineRow} testID={testID}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: colors.textPrimary,
            flex: 1,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            textAlign: 'right',
          }}
        >
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.stackedRow,
        {
          borderBottomColor: colors.borderSubtle,
          paddingVertical: spacing.md,
        },
      ]}
      testID={testID}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.sm,
          marginBottom: spacing.xxs,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  stackedRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
