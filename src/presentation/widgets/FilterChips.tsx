import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DateRangeFilter, TypeFilter } from '@/models/Transaction';
import { useTheme } from '@/theme';

type ChipOption<T extends string> = {
  value: T;
  label: string;
  testID: string;
};

export type TypeFilterChipsProps = {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
  options: ChipOption<TypeFilter>[];
};

export type DateFilterChipsProps = {
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
  options: ChipOption<DateRangeFilter>[];
};

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <ScrollView
      contentContainerStyle={[styles.row, { gap: spacing.sm, paddingHorizontal: spacing.lg }]}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primarySubtle : colors.surface,
                borderColor: selected ? colors.primary : colors.borderSubtle,
                opacity: pressed ? 0.88 : 1,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}
            testID={option.testID}
          >
            <Text
              style={{
                color: selected ? colors.primaryMuted : colors.textSecondary,
                fontSize: typography.fontSize.sm,
                fontWeight: selected
                  ? typography.fontWeight.semibold
                  : typography.fontWeight.medium,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function TypeFilterChips({ value, onChange, options }: TypeFilterChipsProps) {
  return (
    <View style={styles.section}>
      <ChipRow options={options} value={value} onChange={onChange} />
    </View>
  );
}

export function DateFilterChips({ value, onChange, options }: DateFilterChipsProps) {
  return (
    <View style={[styles.section, styles.sectionLast]}>
      <ChipRow options={options} value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: 8,
  },
  sectionLast: {
    marginBottom: 12,
  },
});
