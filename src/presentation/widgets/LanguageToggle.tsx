import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

export type LanguageToggleProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
};

export function LanguageToggle({
  accessibilityLabel,
  label,
  onPress,
}: LanguageToggleProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
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
      testID="language-toggle"
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
