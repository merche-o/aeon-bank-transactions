import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  testID?: string;
};

export type SegmentToggleProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `segmented` = pill track; `chips` = bordered cards side-by-side */
  variant?: 'segmented' | 'chips';
  testID?: string;
};

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  variant = 'segmented',
  testID,
}: SegmentToggleProps<T>) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  if (variant === 'chips') {
    return (
      <View
        style={[styles.row, { gap: spacing.sm, marginBottom: spacing.md }]}
        testID={testID}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? colors.primarySubtle
                    : colors.surface,
                  borderColor: selected ? colors.primary : colors.borderSubtle,
                  flex: 1,
                  paddingVertical: spacing.md,
                },
              ]}
              testID={option.testID}
            >
              <Text
                style={{
                  color: selected ? colors.primaryMuted : colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  textAlign: 'center',
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.segmentedTrack,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
      testID={testID}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentedButton,
              {
                backgroundColor: selected ? colors.primary : 'transparent',
                opacity: pressed ? 0.92 : 1,
                paddingVertical: spacing.sm,
              },
            ]}
            testID={option.testID}
          >
            <Text
              style={{
                color: selected ? colors.textInverse : colors.textPrimary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  segmentedButton: {
    borderRadius: 10,
    flex: 1,
  },
  segmentedTrack: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
});
