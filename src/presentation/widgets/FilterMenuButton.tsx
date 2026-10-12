import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

export type FilterMenuOption<T extends string> = {
  value: T;
  label: string;
  testID: string;
};

export type FilterMenuButtonProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<FilterMenuOption<T>>;
  onChange: (value: T) => void;
  testID: string;
};

export function FilterMenuButton<T extends string>({
  label,
  value,
  options,
  onChange,
  testID,
}: FilterMenuButtonProps<T>) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);
  const valueLabel = selected?.label ?? value;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          },
        ]}
        testID={testID}
      >
        <Text
          numberOfLines={1}
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.xs,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {valueLabel} ▾
        </Text>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(false)}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          testID={`${testID}-backdrop`}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                marginHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              {label}
            </Text>
            {options.map((option) => {
              const selectedOption = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selectedOption
                        ? colors.primarySubtle
                        : 'transparent',
                      opacity: pressed ? 0.85 : 1,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    },
                  ]}
                  testID={option.testID}
                >
                  <Text
                    style={{
                      color: selectedOption ? colors.primary : colors.textPrimary,
                      fontSize: typography.fontSize.md,
                      fontWeight: selectedOption
                        ? typography.fontWeight.semibold
                        : typography.fontWeight.regular,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  option: {
    borderRadius: 8,
  },
  sheet: {
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 360,
    width: '100%',
  },
  trigger: {
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
  },
});
