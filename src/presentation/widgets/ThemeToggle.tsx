import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

export type ThemeToggleProps = {
  label: string;
  onPress: () => void;
};

export function ThemeToggle({ label, onPress }: ThemeToggleProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          opacity: pressed ? 0.88 : 1,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
      ]}
      testID="theme-toggle"
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    borderWidth: 1,
  },
});
