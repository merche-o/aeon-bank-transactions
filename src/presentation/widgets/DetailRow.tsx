import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type DetailRowProps = {
  label: string;
  value: string;
  testID?: string;
};

export function DetailRow({ label, value, testID }: DetailRowProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.row,
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
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
