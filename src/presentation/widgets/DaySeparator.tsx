import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type DaySeparatorProps = {
  dayKey: string;
  title: string;
};

export function DaySeparator({ dayKey, title }: DaySeparatorProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
      }}
      testID={`day-separator-${dayKey}`}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
